// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    UI.init();
    Weather.init();
    Storage.init();

    // Set up event listeners
    setupEventListeners();

    // Set initial date
    updateCurrentDate();

    // Load and render stored entries
    renderEntries();

    // Render calendar
    renderCalendar();
});

// Global variables
let currentMood = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            UI.switchTab(e.target.dataset.tab);
        });
    });

    // Mood selection
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            UI.selectMood(e.target);
            currentMood = e.target.dataset.mood;
        });
    });

    // Save entry
    document.getElementById('save-entry').addEventListener('click', saveEntry);

    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        navigateMonth(-1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        navigateMonth(1);
    });

    // Mood filter
    document.getElementById('mood-filter').addEventListener('change', (e) => {
        filterEntries(e.target.value);
    });
}

function updateCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entry-date').value = today;
}

// This was the test function to set the current date in the input field and display it in the header
// function updateCurrentDate() {
//     // Set date picker value
//     const today = new Date().toISOString().split('T')[0];
//     document.getElementById('entry-date').value = today;

//     // Set formatted date display
//     const options = { month: 'long', day: 'numeric', year: 'numeric' };
//     const formattedDate = new Date().toLocaleDateString('en-US', options);
//     document.getElementById('current-date').textContent = formattedDate;
// }

async function saveEntry() {
    // Get selected date
    const dateInput = document.getElementById('entry-date').value;
    if (!dateInput) {
        alert('Please select a date');
        return;
    }

    // Validate form
    if (!currentMood) {
        alert('Please select a mood');
        return;
    }

    const noteText = document.getElementById('mood-note').value.trim();
    if (!noteText) {
        alert('Please add a note');
        return;
    }

    // Get current weather data
    const weatherData = await Weather.getCurrentWeather();

    // Create entry object
    const entry = {
        date: dateInput,
        mood: currentMood,
        note: noteText,
        weather: {
            temp: weatherData.temp,
            icon: weatherData.icon,
            description: weatherData.description
        }
    };

    // Save entry
    Storage.saveEntry(entry);

    // Reset form
    document.getElementById('mood-note').value = '';
    currentMood = null;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Show notification
    UI.showNotification('Entry saved successfully!');

    // Re-render entries and calendar
    renderEntries();
    renderCalendar();
}

function renderEntries(filter = 'all') {
    const entries = Storage.getEntries();
    const entriesList = document.getElementById('entries-list');
    entriesList.innerHTML = '';

    // Filter entries if needed
    const filteredEntries = filter === 'all'
        ? entries
        : entries.filter(entry => entry.mood === filter);

    // Sort entries by date (newest first)
    const sortedEntries = filteredEntries.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    if (sortedEntries.length === 0) {
        entriesList.innerHTML = '<p class="no-entries">No entries found</p>';
        return;
    }

    // Create entry cards
    sortedEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        // Clone the template
        const template = document.getElementById('entry-template');
        const entryCard = template.content.cloneNode(true);

        // Fill in the data
        entryCard.querySelector('.entry-mood').textContent = getMoodEmoji(entry.mood);
        entryCard.querySelector('.entry-mood').style.backgroundColor = getMoodColor(entry.mood);
        entryCard.querySelector('.entry-note').textContent = entry.note;
        entryCard.querySelector('.entry-date').textContent = formattedDate;
        entryCard.querySelector('.weather-icon').textContent = entry.weather.icon;
        entryCard.querySelector('.weather-temp').textContent = `${entry.weather.temp}°C`;

        entriesList.appendChild(entryCard);
    });
}

function filterEntries(filter) {
    renderEntries(filter);
}

function renderCalendar() {
    const calendarDates = document.getElementById('calendar-dates');
    const monthYearDisplay = document.getElementById('calendar-month-year');

    // Clear previous calendar
    calendarDates.innerHTML = '';

    // Set month and year display
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearDisplay.textContent = `${months[currentMonth]} ${currentYear}`;

    // Get first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    // Get last date of the month
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get last date of previous month
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();

    // Get entries data for highlighting dates with entries
    const entries = Storage.getEntries();
    const entriesMap = new Map();

    entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (
            entryDate.getFullYear() === currentYear &&
            entryDate.getMonth() === currentMonth
        ) {
            const dateKey = entryDate.getDate();
            entriesMap.set(dateKey, entry.mood);
        }
    });

    // Create calendar grid
    let date = 1;
    let nextMonthDate = 1;

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dateElem = document.createElement('div');
        dateElem.classList.add('calendar-date', 'other-month');
        dateElem.textContent = prevMonthLastDate - i;
        calendarDates.appendChild(dateElem);
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
        const dateElem = document.createElement('div');
        dateElem.classList.add('calendar-date', 'current-month');
        dateElem.textContent = i;

        // Check if this date has an entry
        if (entriesMap.has(i)) {
            dateElem.classList.add('has-entry');
            dateElem.style.backgroundColor = getMoodColor(entriesMap.get(i));
            dateElem.style.color = '#fff';
        }

        // Check if this is today
        const today = new Date();
        if (i === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()) {
            dateElem.classList.add('selected');
        }

        calendarDates.appendChild(dateElem);
    }

    // Fill the rest with next month days
    const totalDaysDisplayed = firstDay + lastDate;
    const daysToAdd = 42 - totalDaysDisplayed;

    for (let i = 1; i <= daysToAdd; i++) {
        const dateElem = document.createElement('div');
        dateElem.classList.add('calendar-date', 'other-month');
        dateElem.textContent = i;
        calendarDates.appendChild(dateElem);
    }
}

function navigateMonth(delta) {
    currentMonth += delta;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    renderCalendar();
}

function getMoodEmoji(mood) {
    const emojis = {
        'happy': '😄',
        'neutral': '😐',
        'sad': '😔',
        'angry': '😠',
        'sick': '🤢'
    };

    return emojis[mood] || '😐';
}

function getMoodColor(mood) {
    const colors = {
        'happy': '#ffcb66',
        'neutral': '#b3b3b3',
        'sad': '#6699cc',
        'angry': '#ff6b6b',
        'sick': '#a5d6a7'
    };

    return colors[mood] || '#b3b3b3';
}