// Weather API integration
const Weather = {
    apiKey: 'YOUR_OPENWEATHERMAP_API_KEY', // Replace with your OpenWeatherMap API key
    location: {
        lat: null,
        lon: null
    },

    init: function () {
        this.getLocation();
    },

    getLocation: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.location.lat = position.coords.latitude;
                    this.location.lon = position.coords.longitude;
                    this.fetchWeather();
                },
                error => {
                    console.error('Error getting location:', error);
                    // Use default location (London) if geolocation fails
                    this.location.lat = 51.5074;
                    this.location.lon = 0.1278;
                    this.fetchWeather();
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser');
            // Use default location (London)
            this.location.lat = 51.5074;
            this.location.lon = 0.1278;
            this.fetchWeather();
        }
    },

    fetchWeather: async function () {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.location.lat}&lon=${this.location.lon}&units=metric&appid=${this.apiKey}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Weather data not available');
            }

            const data = await response.json();

            const weatherData = {
                temp: Math.round(data.main.temp),
                icon: this.getWeatherIcon(data.weather[0].icon),
                description: data.weather[0].description
            };

            // Update UI with weather data
            document.getElementById('weather-icon').textContent = weatherData.icon;
            document.getElementById('weather-temp').textContent = `${weatherData.temp}°C`;

            // Store current weather data
            this.currentWeather = weatherData;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            // Use mock data if API call fails
            this.currentWeather = {
                temp: 25,
                icon: '☀️',
                description: 'sunny'
            };

            // Update UI with mock weather data
            document.getElementById('weather-icon').textContent = this.currentWeather.icon;
            document.getElementById('weather-temp').textContent = `${this.currentWeather.temp}°C`;
        }
    },

    getCurrentWeather: async function () {
        if (!this.currentWeather) {
            await this.fetchWeather();
        }

        return this.currentWeather;
    },

    getWeatherIcon: function (iconCode) {
        // Map OpenWeatherMap icon codes to emoji icons
        const iconMap = {
            '01d': '☀️', // clear sky day
            '01n': '🌙', // clear sky night
            '02d': '⛅', // few clouds day
            '02n': '☁️', // few clouds night
            '03d': '☁️', // scattered clouds
            '03n': '☁️',
            '04d': '☁️', // broken clouds
            '04n': '☁️',
            '09d': '🌧️', // shower rain
            '09n': '🌧️',
            '10d': '🌦️', // rain day
            '10n': '🌧️', // rain night
            '11d': '⛈️', // thunderstorm
            '11n': '⛈️',
            '13d': '❄️', // snow
            '13n': '❄️',
            '50d': '🌫️', // mist
            '50n': '🌫️'
        };

        return iconMap[iconCode] || '⛅';
    }
};