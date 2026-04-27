import { useEffect, useState } from 'react';
import {
  ThemeMode,
  applyTheme,
  applySavedThemeOnLoad,
} from '../../../utils/theme';

export const SettingsScreen = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    const mode = applySavedThemeOnLoad();
    setThemeMode(mode);
  }, []);
  // Updates the theme in DOM and localStorage
  const handleThemeChange = (mode: ThemeMode) => {
    applyTheme(mode);
    setThemeMode(mode);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Theme</h2>
            <p className="text-base-content/80 text-sm">
              Choose your theme preference
            </p>
          </div>

          <label className="fieldset">
            <span className="label">Appearance</span>
            <select
              className="select select-primary validator w-full max-w-xs"
              value={themeMode}
              // Updates theme in DOM and localStorage
              onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
            >
              <option value="system">System default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
