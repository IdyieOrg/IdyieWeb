import { openSettingsHandler } from './modal.js';

export function attachSidebarHandlers() {
  var sidebar = document.getElementById('sidebar');
  var toggleBtn = document.getElementById('toggleSidebar');
  var promptPage = document.querySelector('.prompt-page');

  if (toggleBtn && sidebar && promptPage) {
    var icon = toggleBtn.querySelector('i');
    const savedSidebarState = localStorage.getItem('sidebar_open');
    const shouldOpenSidebar = savedSidebarState === null ? true : savedSidebarState === 'true';

    if (shouldOpenSidebar) {
      if (sidebar) sidebar.classList.remove('closed');
      if (promptPage) promptPage.classList.remove('sidebar-closed');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    } else {
      if (sidebar) sidebar.classList.add('closed');
      if (promptPage) promptPage.classList.add('sidebar-closed');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }

    toggleBtn.removeEventListener('click', toggleSidebarHandler);
    toggleBtn.addEventListener('click', toggleSidebarHandler);

    function toggleSidebarHandler(e) {
      e.stopPropagation();
      const isClosed = sidebar ? sidebar.classList.toggle('closed') : false;
      if (promptPage) promptPage.classList.toggle('sidebar-closed', isClosed);
      localStorage.setItem('sidebar_open', (!isClosed).toString());
      if (icon) {
        if (isClosed) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        } else {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        }
      }
    }
  }

  const openSettingsBtn = document.getElementById('openSettingsModal');
  if (openSettingsBtn) {
    openSettingsBtn.removeEventListener('click', openSettingsHandler);
    openSettingsBtn.addEventListener('click', openSettingsHandler);
  }

  const closeSidebarBtn = document.getElementById('closeSidebar');
  if (closeSidebarBtn) {
    closeSidebarBtn.onclick = function() {
      if (sidebar) sidebar.classList.add('closed');
      if (promptPage) promptPage.classList.add('sidebar-closed');
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

  if (sidebar) {
    const observer = new MutationObserver((mutations) => {
      if (sidebar.classList.contains('closed')) {
        console.log('Prompt: Sidebar closed');
      }
    });
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  }
}
