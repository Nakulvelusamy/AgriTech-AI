import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Content.css";
import { FaSearch, FaMapMarkerAlt, FaCloudRain, FaThermometerHalf } from "react-icons/fa";
import L from 'leaflet';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const VegetationMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Animation effect for elements
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(el => {
      el.classList.add('visible');
    });
  }, []);
  
  const getRandomPrecipitation = () => {
    const levels = [
      { level: "Very Low", min: 0, max: 10, description: "Light drizzle, minimal impact on vegetation. Suitable for drought-resistant crops." },
      { level: "Low", min: 10, max: 30, description: "Light rainfall, generally beneficial for most crops but may require supplemental irrigation." },
      { level: "Moderate", min: 30, max: 60, description: "Moderate rainfall, optimal for most crops and promotes healthy growth." },
      { level: "High", min: 60, max: 100, description: "Heavy rainfall, may cause soil erosion and nutrient leaching. Consider drainage systems." },
      { level: "Very High", min: 100, max: 150, description: "Extreme rainfall, high risk of flooding and crop damage. Not suitable for sensitive crops." }
    ];

    const selectedLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomPrecipitation = (Math.random() * (selectedLevel.max - selectedLevel.min) + selectedLevel.min).toFixed(2);

    return {
      level: selectedLevel.level,
      value: `${randomPrecipitation} mm/hr`,
      description: selectedLevel.description
    };
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_APP_ID;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Failed to fetch weather data. Please try again.");
      return null;
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a location to search");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const weatherData = await fetchWeather(lat, lon);
        const precipitation = getRandomPrecipitation();
        setSelectedLocation({
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          name: data[0].display_name,
          weather: weatherData ? weatherData.weather[0].description : "Unknown",
          temperature: weatherData ? `${weatherData.main.temp}°C` : "Unknown",
          humidity: weatherData ? `${weatherData.main.humidity}%` : "Unknown",
          precipitationLevel: precipitation.level,
          precipitationValue: precipitation.value,
          precipitationDescription: precipitation.description
        });
      } else {
        setError("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <div className="precipitation-container">
      <h2>Geographic Rainfall Simulator</h2>
      
      {error && (
        <div style={{ 
          color: 'var(--danger)', 
          backgroundColor: 'rgba(231, 76, 60, 0.1)', 
          padding: 'var(--space-sm)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: 'var(--space-md)',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto var(--space-lg)'
        }}>
          {error}
        </div>
      )}
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city, region or country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button 
          onClick={searchLocation} 
          disabled={loading}
        >
          {loading ? 'Searching...' : (
            <>
              Search <FaSearch style={{ marginLeft: '5px' }} />
            </>
          )}
        </button>
      </div>
      
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        scrollWheelZoom={true}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution="&copy; OpenStreetMap Contributors" 
        />
        <TileLayer 
          url={`https://tile.planetek.it/api/v1/tiles/precipitation/{z}/{x}/{y}.png?api_key=${import.meta.env.VITE_PLAK_API_KEY}`}
          attribution="Precipitation Data: Planetek API" 
        />
        
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={customIcon}
          >
            <Popup>
              <div style={{ fontFamily: 'var(--font-primary)' }}>
                <p><b><FaMapMarkerAlt /> Location:</b> {selectedLocation.name}</p>
                <p><b><FaThermometerHalf /> Temperature:</b> {selectedLocation.temperature}</p>
                <p><b>Humidity:</b> {selectedLocation.humidity}</p>
                <p><b><FaCloudRain /> Precipitation:</b> {selectedLocation.precipitationLevel} ({selectedLocation.precipitationValue})</p>
                <i>{selectedLocation.precipitationDescription}</i>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="color-container">
        <p style={{color:"blue"}}>Very Low (0-10 mm/hr)</p>
        <p style={{color:"green"}}>Low (10-30 mm/hr)</p>
        <p style={{color:"#ffd700"}}>Moderate (30-60 mm/hr)</p>
        <p style={{color:"#ff4b33"}}>High (60-100 mm/hr)</p>
        <p style={{color:"red"}}>Very High (100+ mm/hr)</p>
      </div>
    </div>
  );
};

export default VegetationMap;
