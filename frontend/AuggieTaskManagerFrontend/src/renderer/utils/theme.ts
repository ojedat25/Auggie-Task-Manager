export type ThemeMode = 'system' | 'light' | 'dark';
export const THEME_KEY = 'auggie-mode';
export const applyTheme = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', mode);
  }
  localStorage.setItem(THEME_KEY, mode);
};
export const applySavedThemeOnLoad = (): ThemeMode => {
  const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    applyTheme(saved);
    return saved;
  }
  applyTheme('system');
  return 'system';
};
