// Fonctions de gestion du modal de paramètres

export function openSettingsHandler(e) {
  console.log('openSettingsHandler called');
  const modalEl = document.getElementById('settingsModal');
  const promptPage = document.querySelector('.prompt-page');
  if (modalEl) {
    console.log('Modal element found, opening modal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    localStorage.setItem('settings_modal_open', 'true');
    if (promptPage) promptPage.classList.add('modal-opened');
    modalEl.addEventListener('hidden.bs.modal', function () {
      console.log('Modal hidden event');
      if (promptPage) promptPage.classList.remove('modal-opened');
      localStorage.setItem('settings_modal_open', 'false');
    }, { once: true });
  } else {
    console.log('Modal element NOT found');
  }
}

export function attachModalHandlers() {
  // Bouton d'ouverture du modal
  const openSettingsBtn = document.getElementById('openSettingsModal');
  if (openSettingsBtn) {
    console.log('Attaching openSettingsHandler to openSettingsBtn');
    openSettingsBtn.removeEventListener('click', openSettingsHandler);
    openSettingsBtn.addEventListener('click', openSettingsHandler);
  } else {
    console.log('openSettingsBtn NOT found');
  }

  // Persistance de l'onglet actif du modal
  document.querySelectorAll('#settingsMenu .nav-link').forEach(function(tab) {
    tab.addEventListener('shown.bs.tab', function(e) {
      localStorage.setItem('settings_modal_active_tab', e.target.id);
    });
  });

  // Réouverture automatique du modal si besoin
  var myModalEl = document.getElementById('settingsModal');
  if (myModalEl && localStorage.getItem('settings_modal_open') === 'true') {
    var myModal = new bootstrap.Modal(myModalEl);
    myModal.show();
    var promptPage = document.querySelector('.prompt-page');
    if (promptPage) promptPage.classList.add('modal-opened');
    myModalEl.addEventListener('hidden.bs.modal', function() {
      if (promptPage) promptPage.classList.remove('modal-opened');
      localStorage.setItem('settings_modal_open', 'false');
    }, { once: true });
    // Restaure l'onglet actif du modal si besoin
    var lastActiveTabId = localStorage.getItem('settings_modal_active_tab');
    if (lastActiveTabId) {
      var lastActiveTab = document.getElementById(lastActiveTabId);
      if (lastActiveTab) {
        var tab = new bootstrap.Tab(lastActiveTab);
        tab.show();
      }
    }
  }
}
