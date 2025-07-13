// Helpers génériques et utilitaires

// Récupère le token CSRF depuis le meta tag
export function getCSRFToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
}

// Génère un ID unique avec un préfixe
export function uniqueId(prefix = '') {
  return prefix + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

// Scroll un élément en bas
export function scrollToBottom(element) {
  if (element) element.scrollTop = element.scrollHeight;
}

// Teste si une string est du HTML (canvas/table)
export function isHtmlContent(str) {
  return typeof str === 'string' && (str.trim().startsWith('<canvas') || str.trim().startsWith('<table'));
}

// Helpers localStorage
export function setLS(key, value) {
  localStorage.setItem(key, value);
}
export function getLS(key, def = null) {
  const val = localStorage.getItem(key);
  return val !== null ? val : def;
}
