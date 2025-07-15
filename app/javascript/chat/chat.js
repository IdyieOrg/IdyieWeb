import {
  addExportMenu,
  exportChartAsPDF,
  exportChartAsPNG,
  exportChartAsCSV,
  exportChartAsExcel,
  exportTableAsPDF,
  exportTableAsPNG,
  exportTableAsCSV,
  exportTableAsExcel
} from './export.js';
import { getCSRFToken, uniqueId, scrollToBottom, isHtmlContent } from './utils.js';

export function createSidebarChatElement(chat) {
  const li = document.createElement('li');
  li.setAttribute('data-chat-id', chat.id);
  const link = document.createElement('a');
  link.href = '#';
  link.className = 'sidebar-chat-link';

  // const icon = document.createElement('span');
  // icon.className = 'chatgpt-icon';
  // icon.innerHTML = '<i class="fas fa-message"></i>';
  // link.appendChild(icon);
  
  const title = document.createElement('span');
  title.textContent = chat.title && chat.title.trim() !== '' ? chat.title : `Chat du ${new Date(chat.created_at).toLocaleDateString()}`;
  title.className = 'sidebar-chat-title';
  link.appendChild(title);
  const editBtn = document.createElement('button');
  editBtn.innerHTML = '<i class="fas fa-pen"></i>';
  editBtn.className = 'sidebar-chat-edit-btn';
  editBtn.title = 'Renommer ce chat';
  editBtn.type = 'button';
  editBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll('.sidebar-chat-link.selected').forEach(el => el.classList.remove('selected'));
    link.classList.add('selected');
    selectChat(chat.id, li);
    startEditChatTitle(title, chat.id);
  };
  link.appendChild(editBtn);
  const delBtn = document.createElement('button');
  delBtn.innerHTML = '<i class="fas fa-trash"></i>';
  delBtn.className = 'sidebar-chat-delete-btn';
  delBtn.title = 'Supprimer ce chat';
  delBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!chat.id) {
      alert('Erreur: Impossible de supprimer ce chat (ID manquant)');
      return;
    }
    if (confirm('Supprimer ce chat ?')) {
      const deleteUrl = `/chats/${chat.id}`;
      fetch(deleteUrl, { 
        method: 'DELETE', 
        headers: { 
          'X-CSRF-Token': getCSRFToken(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'same-origin'
      })
      .catch(error => {
        const formData = new FormData();
        formData.append('_method', 'DELETE');
        return fetch(deleteUrl, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': getCSRFToken(),
            'Accept': 'application/json'
          },
          body: formData,
          credentials: 'same-origin'
        });
      })
      .then(resp => resp.text().then(text => ({ response: resp, text: text })))
      .then(({ response, text }) => {
        if (response.ok) {
          if (window.currentChatId === chat.id) {
            window.currentChatId = null;
            localStorage.removeItem('current_chat_id');
            const chatBox = document.getElementById('chat-box');
            if (chatBox) {
              chatBox.innerHTML = '<div class="chat-empty">Sélectionnez un chat pour commencer</div>';
            }
          }
          li.remove();
          const chatList = document.getElementById('sidebar-chat-history');
          if (chatList && chatList.children.length === 0) {
            chatList.innerHTML = '<li class="sidebar-chat-empty">Aucun chat pour le moment</li>';
          }
        } else {
          alert('Erreur lors de la suppression du chat');
        }
      })
      .catch(error => {
        alert('Erreur réseau lors de la suppression');
      });
    }
  };
  link.appendChild(delBtn);
  link.addEventListener('click', function(e) {
    e.preventDefault();
    selectChat(chat.id, li);
  });
  if (window.currentChatId && chat.id == window.currentChatId) {
    link.classList.add('selected');
  }
  li.appendChild(link);
  return li;
}

export function createNewEmptyChat() {
  return fetch('/chats/create_empty', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken()
    }
  })
  .then(resp => {
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    return resp.json();
  })
  .then(chat => {
    console.log('Nouveau chat vide créé automatiquement:', chat);
    if (chat.error) {
      throw new Error(chat.error);
    }
    window.currentChatId = chat.id;
    localStorage.setItem('current_chat_id', chat.id);
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.innerHTML = '<div class="chat-empty">Nouveau chat - Tapez votre message pour commencer</div>';
    }
    const chatList = document.getElementById('sidebar-chat-history');
    if (chatList) {
      const empty = chatList.querySelector('.sidebar-chat-empty');
      if (empty) empty.remove();
      const li = createSidebarChatElement(chat);
      chatList.prepend(li);
    }
    return chat;
  })
  .catch(error => {
    console.error('Erreur lors de la création automatique du chat vide:', error);
    throw error;
  });
}

export function createMessageElement(content, sender, isHtml = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message ' + (sender === 'user' ? 'user' : 'bot');
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  if (isHtml) {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }
  msgDiv.appendChild(bubble);
  if (isHtml && typeof content === 'string') {
    if (isHtmlContent(content)) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const canvas = tempDiv.querySelector('canvas[data-chart]');
      if (canvas && typeof addExportMenu === 'function') {
        addExportMenu(msgDiv, 'chart', canvas.id);
      }
    } else if (isHtmlContent(content)) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const table = tempDiv.querySelector('table');
      if (table && typeof addExportMenu === 'function') {
        addExportMenu(msgDiv, 'table', table.id);
      }
    }
  }
  return msgDiv;
}

export function initializeChartsInContainer(container) {
  container.querySelectorAll('canvas[data-chart]').forEach(canvas => {
    if (canvas && typeof canvas.getContext === 'function') {
      try {
        const chartData = JSON.parse(canvas.getAttribute('data-chart'));
        console.log('Initialisation Chart.js sur', canvas, 'avec data:', chartData);
        new Chart(canvas.getContext('2d'), chartData);
      } catch (e) {
        console.error('Erreur lors de l\'initialisation du chart:', {
          canvas,
          dataChart: canvas.getAttribute('data-chart'),
          error: e
        });
      }
    } else {
      console.warn('Canvas non valide ou getContext non disponible:', canvas);
    }
  });
}

export function addMessageToChatBox(content, sender, isHtml = false) {
  const chatBox = document.getElementById("chat-box");
  const emptyChatMessage = chatBox.querySelector('.chat-empty');
  if (emptyChatMessage && emptyChatMessage.textContent.includes('Nouveau chat')) {
    emptyChatMessage.remove();
  }
  const msgDiv = createMessageElement('', sender, isHtml);
  chatBox.appendChild(msgDiv);

  if (isHtml) {
    msgDiv.querySelector('.bubble').innerHTML = content;
    initializeChartsInContainer(msgDiv);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const canvas = tempDiv.querySelector('canvas[data-chart]');
    const table = tempDiv.querySelector('table');
    if (canvas && typeof addExportMenu === 'function') {
      addExportMenu(msgDiv, 'chart', canvas.id);
    } else if (table && typeof addExportMenu === 'function') {
      addExportMenu(msgDiv, 'table', table.id);
    }
  } else if (sender === 'bot') {
    const bubble = msgDiv.querySelector('.bubble');
    let i = 0;
    function typeWriter() {
      if (i < content.length) {
        bubble.textContent += content[i];
        i++;
        setTimeout(typeWriter, 15);
      }
    }
    typeWriter();
  } else {
    msgDiv.querySelector('.bubble').textContent = content;
  }
  scrollToBottom(chatBox);
}

export function renderMessages(messages) {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;
  chatBox.innerHTML = '';
  if (!messages || messages.length === 0) {
    chatBox.innerHTML = '<div class="chat-empty">Aucun message dans ce chat</div>';
    return;
  }
  messages.forEach(msg => {
    const isHtml = typeof msg.content === 'string' && (
      isHtmlContent(msg.content) ||
      isHtmlContent(msg.content)
    );
    const msgDiv = createMessageElement(msg.content, msg.role, isHtml);
    chatBox.appendChild(msgDiv);
  });
  initializeChartsInContainer(chatBox);
  requestAnimationFrame(() => {
    scrollToBottom(chatBox);
  });
}

export function treatResponse(response) {
  try {
    const data = JSON.parse(response.data);
    if (Array.isArray(data)) {
      addMessageToChatBox("Aucun résultat", "bot");
    } else if (data.data_type === "barChart") {
      const canvasId = uniqueId('chart-');
      const canvasHtml = `<canvas id="${canvasId}" width="400" height="200" data-chart='${JSON.stringify(data.content)}'></canvas>`;
      addMessageToChatBox(canvasHtml, "bot", true);
    } else if (data.data_type === "table") {
      let tableId = uniqueId('table-');
      let tableHtml = `<table id="${tableId}" class="table table-striped">`;
      tableHtml += '<thead><tr>';
      data.content.columns.forEach(column => {
        tableHtml += `<th>${column}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      data.content.rows.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
          tableHtml += `<td>${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table>';
      addMessageToChatBox(tableHtml, "bot", true);
      if (typeof addExportMenu === 'function') addExportMenu(msgDiv, "table", tableId);
    } else {
      addMessageToChatBox("Réponse inconnue", "bot");
    }
  } catch (e) {
    addMessageToChatBox("Erreur de traitement de la réponse", "bot");
  }
}

export function addMessageToChatBoxTest(content) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.style.background = "#7FFFAB";
  messageDiv.style.color = "#111";
  messageDiv.style.padding = "10px";
  messageDiv.style.borderRadius = "5px";
  messageDiv.style.maxWidth = "70%";
  messageDiv.style.margin = "10px 0";
  messageDiv.textContent = content;
  chatBox.appendChild(messageDiv);
  scrollToBottom(chatBox);
}

export function selectChat(chatId, liElement) {
  window.currentChatId = chatId;
  console.log('selectChat appelé, currentChatId =', window.currentChatId);
  localStorage.setItem('current_chat_id', chatId);
  document.querySelectorAll('.sidebar-chat-link.selected').forEach(el => el.classList.remove('selected'));
  if (liElement) {
    liElement.querySelector('.sidebar-chat-link').classList.add('selected');
  }
  fetch(`/chats/${chatId}.json`)
    .then(resp => resp.json())
    .then(data => {
      renderMessages(data.messages);
      const chatBox = document.getElementById('chat-box');
      requestAnimationFrame(() => {
        if (chatBox) scrollToBottom(chatBox);
      });
    })
    .catch(() => {
      const chatBox = document.getElementById('chat-box');
      if (chatBox) chatBox.innerHTML = '<div class="chat-error">Erreur lors du chargement du chat</div>';
    });
}

export function loadChats(callback) {
  const chatList = document.getElementById('sidebar-chat-history');
  if (!chatList) return;
  
  const existingChats = chatList.querySelectorAll('.sidebar-chat-link');
  if (existingChats.length === 0) {
    showSkeletonLoading();
  }
  
  fetch('/chats.json')
    .then(response => response.json())
    .then(chats => {
      hideSkeletonLoading();
      chatList.innerHTML = '';
      if (chats.length === 0) {
        chatList.innerHTML = '<li class="sidebar-chat-empty">Aucun chat pour le moment</li>';
        if (callback) callback();
        return;
      }
      chats.forEach(chat => {
        const li = createSidebarChatElement(chat);
        chatList.appendChild(li);
      });
      const selectedId = localStorage.getItem('current_chat_id');
      if (selectedId) {
        const selectedLi = chatList.querySelector(`li[data-chat-id='${selectedId}']`);
        if (selectedLi) selectedLi.querySelector('.sidebar-chat-link').classList.add('selected');
      }
      if (callback) callback();
    })
    .catch(error => {
      hideSkeletonLoading();
      chatList.innerHTML = '<li class="sidebar-chat-error">Erreur lors du chargement</li>';
      if (callback) callback();
    });
}

export function initChatSystem() {
  const chatList = document.getElementById('sidebar-chat-history');
  const newChatBtn = document.getElementById('new-chat-btn');
  if (chatList) {
    const isFirstLoad = !localStorage.getItem('chats_loaded');
    if (isFirstLoad) {
      showSkeletonLoading();
      localStorage.setItem('chats_loaded', 'true');
    }
    loadChats();
  }
  if (newChatBtn) {
    newChatBtn.addEventListener('click', function() {
      fetch('/chats/create_empty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken()
        }
      })
      .then(resp => resp.json())
      .then(chat => {
        window.currentChatId = chat.id;
        localStorage.setItem('current_chat_id', chat.id);
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
          chatBox.innerHTML = '<div class="chat-empty">Nouveau chat - Tapez votre message pour commencer</div>';
        }
      })
      .catch(error => {
        alert('Erreur lors de la création du chat');
      });
    });
  }
}

export function startEditChatTitle(titleSpan, chatId) {
  const oldTitle = titleSpan.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldTitle;
  input.className = 'sidebar-chat-title-input';
  input.style.width = (titleSpan.offsetWidth) + 'px';
  titleSpan.replaceWith(input);
  input.focus();
  input.select();
  function save() {
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== oldTitle) {
      fetch(`/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken()
        },
        body: JSON.stringify({ chat: { title: newTitle } })
      })
      .then(resp => resp.json())
      .then((data) => {
        input.replaceWith(titleSpan);
        titleSpan.textContent = newTitle;
        moveChatToTop(chatId);
      });
    } else {
      cancel();
    }
  }
  function cancel() {
    input.replaceWith(titleSpan);
  }
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  });
  input.addEventListener('blur', save);
}

export function moveChatToTop(chatId) {
  const chatList = document.getElementById('sidebar-chat-history');
  const li = chatList && chatList.querySelector(`li[data-chat-id='${chatId}']`);
  if (li && chatList.firstElementChild !== li) {
    chatList.prepend(li);
    li.classList.add('just-updated');
    setTimeout(() => li.classList.remove('just-updated'), 800);
  }
}

function createSkeletonItem() {
  const skeletonItem = document.createElement('div');
  skeletonItem.className = 'skeleton-item';
  
  const skeletonIcon = document.createElement('div');
  skeletonIcon.className = 'skeleton-icon';
  
  const skeletonTitle = document.createElement('div');
  skeletonTitle.className = 'skeleton-title';
  
  const skeletonActions = document.createElement('div');
  skeletonActions.className = 'skeleton-actions';
  
  const skeletonEdit = document.createElement('div');
  skeletonEdit.className = 'skeleton-action';
  
  const skeletonDelete = document.createElement('div');
  skeletonDelete.className = 'skeleton-action';
  
  skeletonActions.appendChild(skeletonEdit);
  skeletonActions.appendChild(skeletonDelete);
  
  skeletonItem.appendChild(skeletonIcon);
  skeletonItem.appendChild(skeletonTitle);
  skeletonItem.appendChild(skeletonActions);
  
  return skeletonItem;
}

function showSkeletonLoading() {
  const chatList = document.getElementById('sidebar-chat-history');
  if (!chatList) return;
  
  const skeletonContainer = document.createElement('div');
  skeletonContainer.className = 'chat-skeleton';
  skeletonContainer.id = 'chat-skeleton';
  
  chatList.innerHTML = '';
  chatList.appendChild(skeletonContainer);
  
  fetch('/chats.json')
    .then(response => response.json())
    .then(chats => {
      const actualCount = chats.length;
      updateSkeletonCount(actualCount);
    })
    .catch(() => {
      console.log('Impossible de récupérer le nombre de chats, utilisation du skeleton par défaut');
      updateSkeletonCount(3);
    });
}

function updateSkeletonCount(actualCount) {
  const skeletonContainer = document.getElementById('chat-skeleton');
  if (!skeletonContainer) return;
  
  let skeletonCount;
  if (actualCount === 0) {
    skeletonCount = 1;
  } else if (actualCount <= 15) {
    skeletonCount = actualCount;
  } else {
    skeletonCount = 15;
  }
  
  skeletonContainer.innerHTML = '';
  for (let i = 0; i < skeletonCount; i++) {
    const skeletonItem = createSkeletonItem();
    skeletonContainer.appendChild(skeletonItem);
  }
}

function hideSkeletonLoading() {
  const skeletonContainer = document.getElementById('chat-skeleton');
  if (skeletonContainer) {
    skeletonContainer.remove();
  }
}
