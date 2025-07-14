import {
    createNewEmptyChat,
    createMessageElement,
    initializeChartsInContainer,
    addMessageToChatBox,
    renderMessages,
    treatResponse,
    addMessageToChatBoxTest,
    selectChat,
    loadChats,
    initChatSystem,
    startEditChatTitle,
    createSidebarChatElement,
    moveChatToTop
  } from './chat.js';
import { attachSidebarHandlers } from './sidebar.js';
import { initTheme, toggleTheme } from './theme.js';
import { getCSRFToken, uniqueId, scrollToBottom, isHtmlContent } from './utils.js';
import { attachModalHandlers } from './modal.js';

  if (typeof window.currentChatId === 'undefined') {
    window.currentChatId = null;
  }
  
  console.log('Prompt: Script loaded');

  if (document.readyState === 'loading') {
    console.log('Prompt: DOM still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Prompt: DOM Content Loaded - Initializing prompt page');
      initPromptPage();
    });
  } else {
    console.log('Prompt: DOM already loaded, initializing immediately');
    initPromptPage();
  }

  function initPromptPage() {
    console.log('Prompt: Initializing prompt page functionality');

    initTheme();

    attachSidebarHandlers();
    
    attachModalHandlers();

    (function setupSidebarChatSearch() {
      const searchInput = document.getElementById('sidebar-chat-search');
      const chatList = document.getElementById('sidebar-chat-history');
      if (!searchInput || !chatList) return;

      let initialOrder = [];
      function saveInitialOrder() {
        initialOrder = Array.from(chatList.children).map(li => li.getAttribute('data-chat-id'));
      }
      function restoreInitialOrder() {
      }

      searchInput.addEventListener('input', function(e) {
        const query = searchInput.value.trim().toLowerCase();
        const lis = Array.from(chatList.children).filter(li => li.getAttribute('data-chat-id'));
        if (!query) {
          lis.forEach(li => li.style.display = '');
          return;
          }
        const scored = lis.map(li => {
          const title = li.querySelector('.sidebar-chat-title')?.textContent?.toLowerCase() || '';
          let score = 0;
          if (title.startsWith(query)) score = 2;
          else if (title.includes(query)) score = 1;
          return { li, score, title };
        }).filter(obj => obj.score > 0);
        scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
        scored.forEach(obj => chatList.appendChild(obj.li));
        lis.forEach(li => {
          if (!scored.find(obj => obj.li === li)) li.style.display = 'none';
          else li.style.display = '';
        });
      });

      chatList.addEventListener('click', function(e) {
        const link = e.target.closest('.sidebar-chat-link');
        if (!link) return;
        const li = link.closest('li[data-chat-id]');
        if (!li) return;
        if (searchInput.value.trim()) {
          chatList.querySelectorAll('.sidebar-chat-link.selected').forEach(el => el.classList.remove('selected'));
          link.classList.add('selected');
        }
    });

      searchInput.addEventListener('blur', function() {
        if (!searchInput.value.trim()) {
          Array.from(chatList.children).forEach(li => li.style.display = '');
        }
      });
    })();

    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';

      const microphone = document.getElementById('microphone');
      if (microphone) {
        microphone.style.color = "white";

        recognition.onstart = function() {
            console.log('Prompt: Reconnaissance vocale démarrée');
            microphone.style.color = "#7FFFAB";
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            const input = document.querySelector("input[name='search[query]']");
            if (input) input.value = transcript;
            console.log('Prompt: Transcription : ', transcript);
        };

        recognition.onerror = function(event) {
            console.error('Prompt: Erreur de reconnaissance vocale : ', event.error);
            microphone.style.color = "red";
        };

        recognition.onend = function() {
            console.log('Prompt: Reconnaissance vocale terminée');
            microphone.style.color = "white";
        };

        microphone.addEventListener('click', function() {
            recognition.start();
        });
      }
    } else {
        console.error("Prompt: L'API Web Speech n'est pas supportée par ce navigateur.");
        alert("L'API Web Speech n'est pas supportée par ce navigateur.");
    }


    const promptForm = document.querySelector('.prompt-input-bar');
    if (promptForm) {
      promptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = promptForm.querySelector('.prompt-input');
        const value = input.value.trim();
        console.log('SUBMIT TRIGGERED');
        console.log('currentChatId:', window.currentChatId);
        console.log('input value:', value);
        

        function sendMessage() {
          if (value && window.currentChatId) {
            addMessageToChatBox(value, 'user');
            console.log('Envoi du message à', `/chats/${window.currentChatId}/messages`);
            fetch(`/chats/${window.currentChatId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCSRFToken()
              },
              body: JSON.stringify({ message: { role: 'user', content: value } })
            })
            .then(resp => {
              console.log('Réponse du serveur:', resp);
              return resp.json();
            })
            .then(data => {
              console.log('Données reçues:', data);
              if (!localStorage.getItem('current_chat_id')) {
                localStorage.setItem('current_chat_id', window.currentChatId);
              }
              const chatList = document.getElementById('sidebar-chat-history');
              const chatId = data.chat_id || window.currentChatId;
              if (chatList && chatId && !chatList.querySelector(`[data-chat-id='${chatId}']`)) {
                chatList.querySelectorAll('.sidebar-chat-link.selected').forEach(el => el.classList.remove('selected'));
                const chat = {
                  id: chatId,
                  title: data.chat_title || 'Nouveau chat',
                  created_at: data.chat_created_at || new Date().toISOString()
                };
                const li = createSidebarChatElement(chat);
                chatList.prepend(li);
                li.querySelector('.sidebar-chat-link').classList.add('selected');
              }
              if (typeof moveChatToTop === 'function') {
                moveChatToTop(chatId);
              }
              const searchInput = document.getElementById('sidebar-chat-search');
              if (searchInput && searchInput.value.trim()) {
                searchInput.value = '';
              if (chatList) {
                  Array.from(chatList.children).forEach(li => li.style.display = '');
                }
              }
            })
            .catch(err => {
              console.error('Erreur lors du fetch:', err);
            });
          input.value = '';
          fetch('/prompts/send_to_api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-CSRF-Token': getCSRFToken()
            },
            body: 'query=' + encodeURIComponent(value)
          })
          .then(response => response.json())
          .then(response => {
              let botContent = null;
            try {
              const data = JSON.parse(response.data);
              if (Array.isArray(data)) {
                  botContent = "Aucun résultat";
              } else if (data.data_type === "barChart") {
                const canvasId = uniqueId('chart-');
                const chartConfig = JSON.stringify(data.content);
                console.log('Chart data reçu avant affichage:', data.content);
                botContent = `<canvas id="${canvasId}" width="400" height="200" data-chart='${chartConfig.replace(/'/g, "&apos;")}'></canvas>`;
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
                  botContent = tableHtml;
              } else {
                  botContent = "Réponse inconnue";
              }
            } catch (e) {
                botContent = "Erreur de traitement de la réponse";
              }
              const isHtml = typeof botContent === 'string' && (
                botContent.trim().startsWith('<canvas') ||
                botContent.trim().startsWith('<table')
              );
              addMessageToChatBox(botContent, 'bot', isHtml);
              fetch(`/chats/${window.currentChatId}/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-Token': getCSRFToken()
                },
                body: JSON.stringify({ message: { role: 'assistant', content: botContent } })
              })
              .then(resp => resp.json())
            .then(() => {});
          })
          .catch(() => {
              fetch(`/chats/${window.currentChatId}/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-Token': getCSRFToken()
                },
                body: JSON.stringify({ message: { role: 'assistant', content: "Une erreur est survenue" } })
              })
              .then(resp => resp.json())
              .then(() => {
                selectChat(window.currentChatId);
              });
            });
          } else if (value && !window.currentChatId) {
            console.log('Aucun chat disponible, création d\'un nouveau chat...');
            createNewEmptyChat().then((chat) => {
              window.currentChatId = chat.id;
              const chatList = document.getElementById('sidebar-chat-history');
              console.log('[DEBUG] Tentative d\'ajout local du chat', chat);
              if (chatList && !chatList.querySelector(`[data-chat-id='${chat.id}']`)) {
                const li = createSidebarChatElement(chat);
                chatList.prepend(li);
                console.log('[DEBUG] Chat ajouté localement au DOM', chat);
              } else {
                console.log('[DEBUG] Chat déjà présent dans la liste ou chatList introuvable', chat);
              }
              console.log('Chat créé, envoi du message...');
              sendMessage();
          });
            return;
        }
        }
        sendMessage();
      });
    }

    initChatSystem();

    const savedChatId = localStorage.getItem('current_chat_id');
    if (savedChatId) {
      selectChat(savedChatId);
    } else {
      createNewEmptyChat();
    }

    console.log('Prompt: Prompt page initialization complete');
  }

  if (typeof XLSX === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    document.head.appendChild(script);
  }
