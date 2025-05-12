import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useMap } from "react-leaflet";
import L from "leaflet";
import './ImageUpload.css';
import { FaMapMarkerAlt, FaTrash, FaCropAlt, FaRulerCombined, FaWeightHanging } from "react-icons/fa";

// Custom search control styling
import "leaflet-geosearch/dist/geosearch.css";

const SearchBox = ({ setCenter }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      showMarker: false,
      autoClose: true,
      keepResult: false,
      style: 'bar',
      searchLabel: 'Search for a location',
      notFoundMessage: 'No location found. Try another search.',
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result) => {
      setCenter([result.location.y, result.location.x]);
      map.setView([result.location.y, result.location.x], 15);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, setCenter]);

  return null;
};

const MapComponent = ({ setArea, polygonPoints, setPolygonPoints }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPolygonPoints([...polygonPoints, [lat, lng]]);
    },
  });

  useEffect(() => {
    if (polygonPoints.length > 2) {
      const polygon = turf.polygon([
        [...polygonPoints, polygonPoints[0]].map(([lat, lng]) => [lng, lat])
      ]);
      const calculatedArea = turf.area(polygon) / 10000;
      setArea(calculatedArea.toFixed(2));
    }
  }, [polygonPoints, setArea]);

  return polygonPoints.length > 2 ? (
    <Polygon 
      positions={polygonPoints} 
      pathOptions={{ 
        color: 'var(--primary)',
        weight: 3,
        fillColor: 'var(--primary-light)',
        fillOpacity: 0.3
      }} 
    />
  ) : null;
};

const App = () => {
  const [area, setArea] = useState(0);
  const [production, setProduction] = useState(0);
  const [center, setCenter] = useState([20, 77]);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const areaRef = useRef(null);
  const productionRef = useRef(null);
  
  const cropYields = {
    wheat: 3.2,
    rice: 4.5,
    maize: 5.0,
    barley: 2.8,
    soybean: 2.5,
    cotton: 1.8,
  };

  useEffect(() => {
    if (area > 0) {
      setProduction((area * cropYields[selectedCrop]).toFixed(2));
      
      // Add animation when values change
      if (areaRef.current) {
        areaRef.current.classList.add('highlight');
        setTimeout(() => {
          areaRef.current.classList.remove('highlight');
        }, 1000);
      }
      
      if (productionRef.current) {
        productionRef.current.classList.add('highlight');
        setTimeout(() => {
          productionRef.current.classList.remove('highlight');
        }, 1000);
      }
    } else {
      setProduction(0);
    }
  }, [area, selectedCrop]);

  const handleClearPoints = () => {
    setPolygonPoints([]);
    setArea(0);
    setProduction(0);
  };

  return (
    <div className="s1">
      <h2>Crop Production Estimator</h2>
      <p>
        Draw your field boundaries by clicking points on the map. 
        Our advanced algorithm will calculate the area and estimate crop production 
        based on regional yield data.
      </p>

      <div className="s2">
        <label htmlFor="crop-select">
          <FaCropAlt style={{ marginRight: '8px', color: 'var(--primary)' }} />
          Select Crop Type:
        </label>
        <select 
          id="crop-select"
          value={selectedCrop} 
          onChange={(e) => setSelectedCrop(e.target.value)}
        >
          <option value="wheat">Wheat</option>
          <option value="rice">Rice</option>
          <option value="maize">Maize</option>
          <option value="barley">Barley</option>
          <option value="soybean">Soybean</option>
          <option value="cotton">Cotton</option>
        </select>
      </div>
      
      <div className="btn3">
        <button onClick={handleClearPoints}>
          <FaTrash style={{ marginRight: '8px' }} /> Clear Points
        </button>
      </div>

      <MapContainer 
        center={center} 
        zoom={5} 
        style={{ height: "600px", width: "90%", maxWidth: "1000px", margin: "auto" }}
        scrollWheelZoom={true}
      >
        <TileLayer 
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
          attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />
        <SearchBox setCenter={setCenter} />
        <MapComponent 
          setArea={setArea} 
          polygonPoints={polygonPoints} 
          setPolygonPoints={setPolygonPoints} 
        />
        {polygonPoints.map((position, index) => (
          <Marker 
            key={index} 
            position={position} 
            icon={L.divIcon({ 
              className: 'custom-marker', 
              iconSize: [12, 12],
              html: `<div style="background-color: var(--primary); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`
            })} 
          />
        ))}
      </MapContainer>
      
      <div className="s3">
        <h2 ref={areaRef}>
          <FaRulerCombined style={{ marginRight: '10px', color: 'var(--primary)' }} />
          Land Area: {area} hectares
        </h2>
        <h2 ref={productionRef}>
          <FaWeightHanging style={{ marginRight: '10px', color: 'var(--primary)' }} />
          Estimated {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Production: {production} tons
        </h2>
      </div>
      
      {area > 0 && (
        <p style={{ 
          maxWidth: '700px', 
          margin: '30px auto', 
          padding: '15px 20px', 
          backgroundColor: 'var(--primary-lightest)', 
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--primary)',
          color: 'var(--primary-dark)',
          textAlign: 'left',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          <strong>Analysis:</strong> Based on your selected area of {area} hectares, you can expect to produce approximately {production} tons of {selectedCrop} under optimal growing conditions. This estimate uses regional average yield data of {cropYields[selectedCrop]} tons per hectare for {selectedCrop}.
        </p>
      )}
    </div>
  );
};

export default App;
