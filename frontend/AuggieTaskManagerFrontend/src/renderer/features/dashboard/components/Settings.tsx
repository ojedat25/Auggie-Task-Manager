import { useEffect, useState } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';

// Key used to store the theme mode in localStorage
const THEME_KEY = 'auggie-mode';

export const SettingsScreen = () => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('system');

    useEffect(() => {
        // Get the saved theme mode from localStorage
        const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
            applyTheme(saved);
            setThemeMode(saved);
            return;
        }
        applyTheme('system');
        setThemeMode('system');
    }, []);

    const applyTheme = (mode: ThemeMode) => {
        const root = document.documentElement;
        // If the mode is system, remove the data-theme attribute
        if (mode === 'system') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', mode);
        }
        localStorage.setItem(THEME_KEY, mode);
        setThemeMode(mode);
    };

    return (
        <div className = "p-4 space-y-4">
            <h1 className = "text-2xl font-bold">Settings</h1>
            <div className = "card bg-base-100 shadow-md">
              <div className = "card-body space-y-4">
                <div>
                    <h2 className = "text-lg font-semibold">Theme</h2>
                    <p className = "text-base-content/80 text-sm">Choose your theme preference</p>
                </div>

                <label className = "fieldset">
                    <span className = "label">Appearance</span>
                    <select
                        className = "select select-primary validator w-full max-w-xs"
                        value = {themeMode}
                        onChange = {(e) => applyTheme(e.target.value as ThemeMode)}
                    >
                        <option value = "system">System default</option>
                        <option value = "light">Light</option>
                        <option value = "dark">Dark</option>
                    </select>
                </label>
              </div>
            </div>
        </div>
    );
};

export default SettingsScreen;