// settings.js
export class SettingsManager {
    constructor() {
        this.settingsKey = 'userPreferences';
        this.defaultSettings = {
            theme: 'light',
            language: 'en',
            notifications: 'false'
        };
    }

    saveSetting(key, value) {
        const settings = this.loadSettings();
        settings[key] = value;
        localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    }

    getSetting(key) {
        const settings = this.loadSettings();
        return settings[key];
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem(this.settingsKey);
            return stored ? JSON.parse(stored) : this.defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.defaultSettings;
        }
    }

    resetSettings() {
        localStorage.removeItem(this.settingsKey);
    }
}
