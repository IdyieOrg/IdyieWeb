export function initTheme() {
  const savedTheme = localStorage.getItem('idyie_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  console.log('Prompt: Theme set to:', savedTheme);
}

export function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('idyie_theme', newTheme);
  console.log('Prompt: Theme toggled to:', newTheme);
}
