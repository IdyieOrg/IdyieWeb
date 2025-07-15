export function getCSRFToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
}

export function uniqueId(prefix = '') {
  return prefix + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

export function scrollToBottom(element) {
  if (element) element.scrollTop = element.scrollHeight;
}

export function isHtmlContent(str) {
  return typeof str === 'string' && (str.trim().startsWith('<canvas') || str.trim().startsWith('<table'));
}

export function setLS(key, value) {
  localStorage.setItem(key, value);
}

export function getLS(key, def = null) {
  const val = localStorage.getItem(key);
  return val !== null ? val : def;
}
