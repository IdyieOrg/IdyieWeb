// Fonctions de gestion de la sidebar

import { openSettingsHandler } from './modal.js';

export function attachSidebarHandlers() {
  var sidebar = document.getElementById('sidebar');
  var toggleBtn = document.getElementById('toggleSidebar');
  var promptPage = document.querySelector('.prompt-page');

  if (toggleBtn && sidebar && promptPage) {
    var icon = toggleBtn.querySelector('i');
    // Récupérer l'état sauvegardé de la sidebar ou ouvrir par défaut
    const savedSidebarState = localStorage.getItem('sidebar_open');
    const shouldOpenSidebar = savedSidebarState === null ? true : savedSidebarState === 'true';

    if (shouldOpenSidebar) {
      if (sidebar) sidebar.classList.add('open');
      if (promptPage) promptPage.classList.add('sidebar-open');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    } else {
      if (sidebar) sidebar.classList.remove('open');
      if (promptPage) promptPage.classList.remove('sidebar-open');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }

    // Remove any existing listeners to avoid duplicates
    toggleBtn.removeEventListener('click', toggleSidebarHandler);
    toggleBtn.addEventListener('click', toggleSidebarHandler);

    function toggleSidebarHandler(e) {
      e.stopPropagation();
      const isOpen = sidebar ? sidebar.classList.toggle('open') : false;
      if (promptPage) promptPage.classList.toggle('sidebar-open', isOpen);
      localStorage.setItem('sidebar_open', isOpen.toString());
      if (icon) {
        if (isOpen) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    }
  }

  // Handler pour le bouton paramètres dans la sidebar
  const openSettingsBtn = document.getElementById('openSettingsModal');
  if (openSettingsBtn) {
    openSettingsBtn.removeEventListener('click', openSettingsHandler);
    openSettingsBtn.addEventListener('click', openSettingsHandler);
  }

  // Gestion du bouton de fermeture de la sidebar
  const closeSidebarBtn = document.getElementById('closeSidebar');
  if (closeSidebarBtn) {
    closeSidebarBtn.onclick = function() {
      if (sidebar) sidebar.classList.remove('open');
      if (promptPage) promptPage.classList.remove('sidebar-open');
      if (toggleBtn) {
        var icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
      localStorage.setItem('sidebar_open', 'false');
    };
  }

  // DEBUG: observer pour détecter la fermeture de la sidebar
  if (sidebar) {
    const observer = new MutationObserver((mutations) => {
      if (!sidebar.classList.contains('open')) {
        console.log('Prompt: Sidebar closed');
      }
    });
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  }
}
