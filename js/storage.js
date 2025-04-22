// Local storage management
const Storage = {
    STORAGE_KEY: 'mood_journal_entries',

    init: function () {
        // Check if local storage is available
        if (!this.isLocalStorageAvailable()) {
            console.error('Local storage is not available');
            alert('Your browser does not support local storage. Your entries will not be saved between sessions.');
        }
    },

    isLocalStorageAvailable: function () {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    getEntries: function () {
        const entries = localStorage.getItem(this.STORAGE_KEY);
        return entries ? JSON.parse(entries) : [];
    },

    saveEntry: function (entry) {
        const entries = this.getEntries();
        entries.push(entry);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    },

    deleteEntry: function (entryDate) {
        let entries = this.getEntries();
        entries = entries.filter(entry => entry.date !== entryDate);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    },

    clearAllEntries: function () {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    getEntriesByDate: function (year, month, day) {
        const entries = this.getEntries();
        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return (
                entryDate.getFullYear() === year &&
                entryDate.getMonth() === month &&
                entryDate.getDate() === day
            );
        });
    },

    getEntriesByMood: function (mood) {
        const entries = this.getEntries();
        return entries.filter(entry => entry.mood === mood);
    },

    exportEntries: function (format = 'json') {
        const entries = this.getEntries();

        if (format === 'json') {
            return JSON.stringify(entries, null, 2);
        } else if (format === 'csv') {
            // Convert to CSV format
            const headers = ['Date', 'Mood', 'Note', 'Weather Temp', 'Weather Description'];
            const rows = entries.map(entry => {
                const date = new Date(entry.date).toLocaleDateString();
                return [
                    date,
                    entry.mood,
                    entry.note,
                    `${entry.weather.temp}°C`,
                    entry.weather.description
                ].join(',');
            });

            return [headers.join(','), ...rows].join('\n');
        }

        return null;
    }
};