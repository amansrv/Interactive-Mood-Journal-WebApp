// UI management
const UI = {
    init: function () {
        // Set default tab
        this.switchTab('entry');

        // Add dark mode toggle if supported
        this.setupDarkModeToggle();

        // Setup export functionality
        this.setupExport();
    },

    switchTab: function (tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Deactivate all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`${tabId}-tab`).classList.add('active');

        // Activate selected tab button
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    },

    selectMood: function (moodElement) {
        // Deselect all moods
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Select clicked mood
        moodElement.classList.add('selected');

        // Update theme based on mood
        this.updateThemeByMood(moodElement.dataset.mood);
    },

    updateThemeByMood: function (mood) {
        // Get background container
        const appContainer = document.querySelector('.app-container');

        // Remove previous mood classes
        appContainer.classList.remove('theme-happy', 'theme-neutral', 'theme-sad', 'theme-angry', 'theme-sick');

        // Add new mood class
        appContainer.classList.add(`theme-${mood}`);

        // Update header gradient
        const header = document.querySelector('header');

        const colors = {
            'happy': ['#ffcb66', '#ffd6a5'],
            'neutral': ['#b3b3b3', '#d9d9d9'],
            'sad': ['#6699cc', '#a3c2e3'],
            'angry': ['#ff6b6b', '#ffb3b3'],
            'sick': ['#a5d6a7', '#d1ecd2']
        };

        if (colors[mood]) {
            header.style.background = `linear-gradient(to right, ${colors[mood][0]}, ${colors[mood][1]})`;
        }
    },

    showNotification: function (message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },

    setupDarkModeToggle: function () {
        // Check if the browser supports dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Create dark mode toggle
            const header = document.querySelector('header');

            const darkModeBtn = document.createElement('button');
            darkModeBtn.innerHTML = '🌙';
            darkModeBtn.classList.add('dark-mode-toggle');
            darkModeBtn.title = 'Toggle Dark Mode';
            darkModeBtn.style.background = 'none';
            darkModeBtn.style.border = 'none';
            darkModeBtn.style.fontSize = '1.2rem';
            darkModeBtn.style.cursor = 'pointer';
            darkModeBtn.style.marginLeft = '10px';

            header.appendChild(darkModeBtn);

            // Check if dark mode is already enabled
            if (localStorage.getItem('dark_mode') === 'true') {
                this.enableDarkMode();
                darkModeBtn.innerHTML = '☀️';
            }

            // Add click event
            darkModeBtn.addEventListener('click', () => {
                if (document.body.classList.contains('dark-mode')) {
                    this.disableDarkMode();
                    darkModeBtn.innerHTML = '🌙';
                } else {
                    this.enableDarkMode();
                    darkModeBtn.innerHTML = '☀️';
                }
            });
        }
    },

    enableDarkMode: function () {
        document.body.classList.add('dark-mode');
        document.documentElement.style.setProperty('--bg-color', '#222');
        document.documentElement.style.setProperty('--card-bg', '#333');
        document.documentElement.style.setProperty('--text-color', '#fff');
        localStorage.setItem('dark_mode', 'true');
    },

    disableDarkMode: function () {
        document.body.classList.remove('dark-mode');
        document.documentElement.style.setProperty('--bg-color', '#fff8f0');
        document.documentElement.style.setProperty('--card-bg', '#fff');
        document.documentElement.style.setProperty('--text-color', '#333');
        localStorage.setItem('dark_mode', 'false');
    },

    setupExport: function () {
        // Create export button
        const historyTab = document.getElementById('history-tab');
        const filterContainer = historyTab.querySelector('.filter-container');

        const exportBtnContainer = document.createElement('div');
        exportBtnContainer.style.marginLeft = 'auto';

        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export';
        exportBtn.classList.add('btn');
        exportBtn.style.padding = '8px 16px';
        exportBtn.style.fontSize = '14px';
        exportBtn.style.backgroundColor = 'var(--primary-color)';
        exportBtn.style.color = 'white';

        exportBtnContainer.appendChild(exportBtn);
        filterContainer.appendChild(exportBtnContainer);

        // Add export dropdown
        const exportDropdown = document.createElement('div');
        exportDropdown.classList.add('export-dropdown');
        exportDropdown.style.position = 'absolute';
        exportDropdown.style.backgroundColor = 'white';
        exportDropdown.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        exportDropdown.style.borderRadius = '4px';
        exportDropdown.style.padding = '8px 0';
        exportDropdown.style.display = 'none';
        exportDropdown.style.zIndex = '10';

        const exportOptions = [
            { format: 'csv', label: 'Export as CSV' },
            { format: 'json', label: 'Export as JSON' }
        ];

        exportOptions.forEach(option => {
            const exportOption = document.createElement('div');
            exportOption.textContent = option.label;
            exportOption.style.padding = '8px 16px';
            exportOption.style.cursor = 'pointer';

            exportOption.addEventListener('mouseover', () => {
                exportOption.style.backgroundColor = '#f5f5f5';
            });

            exportOption.addEventListener('mouseout', () => {
                exportOption.style.backgroundColor = 'transparent';
            });

            exportOption.addEventListener('click', () => {
                this.exportData(option.format);
                exportDropdown.style.display = 'none';
            });

            exportDropdown.appendChild(exportOption);
        });

        exportBtnContainer.appendChild(exportDropdown);

        // Toggle dropdown
        exportBtn.addEventListener('click', () => {
            if (exportDropdown.style.display === 'none') {
                exportDropdown.style.display = 'block';

                // Position dropdown
                const btnRect = exportBtn.getBoundingClientRect();
                exportDropdown.style.top = `${btnRect.bottom + 5}px`;
                exportDropdown.style.right = '0';
            } else {
                exportDropdown.style.display = 'none';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!exportBtn.contains(e.target) && !exportDropdown.contains(e.target)) {
                exportDropdown.style.display = 'none';
            }
        });
    },

    exportData: function (format) {
        const data = Storage.exportEntries(format);

        if (!data) {
            this.showNotification('No data to export');
            return;
        }

        // Create download link
        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `mood_journal_export.${format}`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);

        this.showNotification(`Exported successfully as ${format.toUpperCase()}`);
    }
};