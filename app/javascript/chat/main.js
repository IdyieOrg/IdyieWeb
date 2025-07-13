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

  } from './chat.js';
import { attachSidebarHandlers } from './sidebar.js';
import { initTheme, toggleTheme } from './theme.js';
import { getCSRFToken, uniqueId, scrollToBottom, isHtmlContent } from './utils.js';
import { attachModalHandlers } from './modal.js';

  // Variables globales
  if (typeof window.currentChatId === 'undefined') {
    window.currentChatId = null;
  }
  // const currentChatId = window.currentChatId; // SUPPRIMÉ pour éviter l'erreur Turbo
  
  console.log('Prompt: Script loaded');

  // Check if DOM is already loaded
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

    // Initialiser le thème en premier
    // const savedTheme = localStorage.getItem('idyie_theme') || 'dark';
    // document.documentElement.setAttribute('data-theme', savedTheme);
    // console.log('Prompt: Theme set to:', savedTheme);

    // === THEME ===
    initTheme();

    // === SIDEBAR ===
    attachSidebarHandlers();
    
    // === MODAL PARAMÈTRES ===
    attachModalHandlers();

    // Initialisation de la reconnaissance vocale
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

    // Gestion du formulaire avec AJAX pour la réponse bot
    const promptForm = document.querySelector('.prompt-input-bar');
    if (promptForm) {
      promptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = promptForm.querySelector('.prompt-input');
        const value = input.value.trim();
        console.log('SUBMIT TRIGGERED');
        console.log('currentChatId:', window.currentChatId);
        console.log('input value:', value);
        
        // Fonction pour envoyer le message une fois qu'un chat est disponible
        function sendMessage() {
          if (value && window.currentChatId) {
            // Afficher le message utilisateur immédiatement
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
              // Sauvegarder l'ID du chat dans localStorage après le premier message !
              if (!localStorage.getItem('current_chat_id')) {
                localStorage.setItem('current_chat_id', window.currentChatId);
              }
              // Recharger l'historique des chats car le chat a maintenant des messages
              const chatList = document.getElementById('sidebar-chat-history');
              if (chatList) {
                loadChats();
              }
            })
            .catch(err => {
              console.error('Erreur lors du fetch:', err);
            });
          input.value = '';
          // Appel AJAX pour la réponse bot
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
            // Traitement de la réponse
              let botContent = null;
            try {
              const data = JSON.parse(response.data);
              if (Array.isArray(data)) {
                  botContent = "Aucun résultat";
              } else if (data.data_type === "barChart") {
                const canvasId = uniqueId('chart-');
                const chartConfig = JSON.stringify(data.content);
                console.log('Chart data reçu avant affichage:', data.content); // Ajout du log ici
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
              // Affichage live immédiat (avant sauvegarde)
              const isHtml = typeof botContent === 'string' && (
                botContent.trim().startsWith('<canvas') ||
                botContent.trim().startsWith('<table')
              );
              addMessageToChatBox(botContent, 'bot', isHtml);
              // 2. Sauvegarde la réponse bot côté serveur
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
            // Créer un nouveau chat et envoyer le message
            createNewEmptyChat().then((chat) => {
              window.currentChatId = chat.id; // MAJ ici
              console.log('Chat créé, envoi du message...');
              sendMessage(); // Rappel récursif, mais currentChatId est bien défini
          });
        }
        }
        
        // Appeler la fonction d'envoi
        sendMessage();
      });
    }

    // DEBUG: observer pour détecter la fermeture de la sidebar
    // Initialisation du système de chat
    initChatSystem();

    // Charger le chat sauvegardé ou créer un nouveau chat
    const savedChatId = localStorage.getItem('current_chat_id');
    if (savedChatId) {
      selectChat(savedChatId);
    } else {
      createNewEmptyChat();
    }

    // Toggle historique
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const chatHistory = document.getElementById('sidebar-chat-history');
    const historyArrow = document.getElementById('history-arrow');
    let historyCollapsed = false;
    if (toggleHistoryBtn && chatHistory && historyArrow) {
      toggleHistoryBtn.addEventListener('click', function() {
        historyCollapsed = !historyCollapsed;
        chatHistory.classList.toggle('collapsed', historyCollapsed);
        historyArrow.classList.toggle('collapsed', historyCollapsed);
      });
    }

    console.log('Prompt: Prompt page initialization complete');
  }

  // Ajoute SheetJS (xlsx) si pas déjà présent
  if (typeof XLSX === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    document.head.appendChild(script);
  }
