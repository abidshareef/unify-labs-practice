// main.js
import { SettingsManager } from './settings.js';

document.addEventListener('DOMContentLoaded', () => {
    const settingsManager = new SettingsManager();
    const themeToggle = document.getElementById('theme-toggle');
    const languageSelect = document.getElementById('language-select');
    const notificationsToggle = document.getElementById('notifications-toggle');
    const resetButton = document.getElementById('reset-settings');

    // Initialize settings
    settingsManager.loadSettings();

    // Set form values from loaded settings
    themeToggle.value = settingsManager.getSetting('theme') || 'light';
    languageSelect.value = settingsManager.getSetting('language') || 'en';
    notificationsToggle.checked = settingsManager.getSetting('notifications') === 'true';

    // Apply initial settings
    applyTheme(settingsManager.getSetting('theme'));
    applyLanguage(settingsManager.getSetting('language'));

    // Event listeners
    themeToggle.addEventListener('change', () => {
        settingsManager.saveSetting('theme', themeToggle.value);
        applyTheme(themeToggle.value);
    });

    languageSelect.addEventListener('change', () => {
        settingsManager.saveSetting('language', languageSelect.value);
        applyLanguage(languageSelect.value);
    });

    notificationsToggle.addEventListener('change', () => {
        settingsManager.saveSetting('notifications', notificationsToggle.checked.toString());
    });

    resetButton.addEventListener('click', () => {
        if (confirm('Reset all settings to defaults?')) {
            settingsManager.resetSettings();
            location.reload();
        }
    });

    function applyTheme(theme) {
        document.body.className = `${theme}-theme`;
    }

    function applyLanguage(lang) {
        // In a real app, this would change UI text dynamically
        console.log(`Language changed to: ${lang}`);
    }
});
