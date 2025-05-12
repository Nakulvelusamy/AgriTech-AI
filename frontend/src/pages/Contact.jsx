import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, Polygon } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import * as turf from "@turf/turf";
import { db, collection, addDoc, getDocs } from "./firebaseConfig";
import "./Contact.css";
import { FaLeaf, FaWater, FaSeedling, FaSearch, FaChartLine, FaInfoCircle, FaCalculator, FaMapMarkedAlt } from "react-icons/fa";

const SearchBar = ({ setMapCenter, fetchWeather, mapRef }) => {
    const [query, setQuery] = useState("");

    const searchLocation = async () => {
        if (!query) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newCenter = [parseFloat(lat), parseFloat(lon)];
                setMapCenter(newCenter);
                if (mapRef.current) {
                    mapRef.current.setView(newCenter, 10);
                }
                fetchWeather(lat, lon, display_name);
            }
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };

    return (
        <div className="search-bar">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search location" />
            <button onClick={searchLocation}><FaSearch style={{ marginRight: '8px' }} /> Search</button>
        </div>
    );
};

// Define all vegetation indices with their calculation functions
const vegetationIndices = [
    {
        id: 1,
        name: "Normalized Difference Vegetation Index",
        abbreviation: "NDVI",
        formula: "(NIR − Red) / (NIR + Red)",
        purpose: "Vegetation health, biomass",
        category: "vegetation",
        calculate: (bands) => {
            const { nir, red } = bands;
            if (nir === undefined || red === undefined) return null;
            return ((nir - red) / (nir + red)).toFixed(3);
        }
    },
    {
        id: 2,
        name: "Normalized Difference Water Index",
        abbreviation: "NDWI",
        formula: "(Green − NIR) / (Green + NIR)",
        purpose: "Water body detection",
        category: "water",
        calculate: (bands) => {
            const { green, nir } = bands;
            if (green === undefined || nir === undefined) return null;
            return ((green - nir) / (green + nir)).toFixed(3);
        }
    },
    {
        id: 3,
        name: "Modified Anthocyanin Reflectance Index",
        abbreviation: "MASI",
        formula: "(R550 − R700) / (R550 + R700)",
        purpose: "Detects plant pigments (stress marker)",
        category: "stress",
        calculate: (bands) => {
            const { r550, r700 } = bands;
            if (r550 === undefined || r700 === undefined) return null;
            return ((r550 - r700) / (r550 + r700)).toFixed(3);
        }
    },
    {
        id: 4,
        name: "Soil-Adjusted Vegetation Index",
        abbreviation: "SAVI",
        formula: "[(NIR − Red) × (1 + L)] / (NIR + Red + L), L ≈ 0.5",
        purpose: "Vegetation index correcting for soil background",
        category: "soil",
        calculate: (bands) => {
            const { nir, red } = bands;
            const L = 0.5;
            if (nir === undefined || red === undefined) return null;
            return (((nir - red) * (1 + L)) / (nir + red + L)).toFixed(3);
        }
    },
    {
        id: 5,
        name: "Enhanced Vegetation Index",
        abbreviation: "EVI",
        formula: "2.5 × (NIR − Red) / (NIR + 6×Red − 7.5×Blue + 1)",
        purpose: "High biomass vegetation monitoring",
        category: "vegetation",
        calculate: (bands) => {
            const { nir, red, blue } = bands;
            if (nir === undefined || red === undefined || blue === undefined) return null;
            return (2.5 * (nir - red) / (nir + 6 * red - 7.5 * blue + 1)).toFixed(3);
        }
    },
    {
        id: 6,
        name: "Green Chlorophyll Index",
        abbreviation: "GCI",
        formula: "(NIR / Green) − 1",
        purpose: "Chlorophyll content in leaves",
        category: "vegetation",
        calculate: (bands) => {
            const { nir, green } = bands;
            if (nir === undefined || green === undefined) return null;
            return ((nir / green) - 1).toFixed(3);
        }
    },
    {
        id: 7,
        name: "Moisture Stress Index",
        abbreviation: "MSI",
        formula: "SWIR / NIR",
        purpose: "Plant water stress",
        category: "stress",
        calculate: (bands) => {
            const { swir, nir } = bands;
            if (swir === undefined || nir === undefined) return null;
            return (swir / nir).toFixed(3);
        }
    },
    {
        id: 8,
        name: "Normalized Burn Ratio",
        abbreviation: "NBR",
        formula: "(NIR − SWIR) / (NIR + SWIR)",
        purpose: "Burned area detection, fire severity",
        category: "other",
        calculate: (bands) => {
            const { nir, swir } = bands;
            if (nir === undefined || swir === undefined) return null;
            return ((nir - swir) / (nir + swir)).toFixed(3);
        }
    },
    {
        id: 9,
        name: "Normalized Difference Moisture Index",
        abbreviation: "NDMI",
        formula: "(NIR − SWIR) / (NIR + SWIR)",
        purpose: "Vegetation moisture",
        category: "water",
        calculate: (bands) => {
            const { nir, swir } = bands;
            if (nir === undefined || swir === undefined) return null;
            return ((nir - swir) / (nir + swir)).toFixed(3);
        }
    },
    {
        id: 10,
        name: "Red Edge NDVI",
        abbreviation: "NDVIre",
        formula: "(NIR − RedEdge) / (NIR + RedEdge)",
        purpose: "Detects stress before visible change",
        category: "stress",
        calculate: (bands) => {
            const { nir, redEdge } = bands;
            if (nir === undefined || redEdge === undefined) return null;
            return ((nir - redEdge) / (nir + redEdge)).toFixed(3);
        }
    },
    {
        id: 11,
        name: "Leaf Area Index",
        abbreviation: "LAI",
        formula: "Derived from canopy reflectance",
        purpose: "Total leaf area per unit ground area",
        category: "vegetation",
        calculate: (bands) => {
            const { nir, red } = bands;
            if (nir === undefined || red === undefined) return null;
            // Simplified LAI calculation based on NDVI
            const ndvi = (nir - red) / (nir + red);
            return (3.618 * Math.exp(2.12 * ndvi)).toFixed(2);
        }
    },
    {
        id: 12,
        name: "Atmospherically Resistant Vegetation Index",
        abbreviation: "ARVI",
        formula: "(NIR − (2×Red − Blue)) / (NIR + (2×Red − Blue))",
        purpose: "Corrects atmospheric effects",
        category: "vegetation",
        calculate: (bands) => {
            const { nir, red, blue } = bands;
            if (nir === undefined || red === undefined || blue === undefined) return null;
            return ((nir - (2 * red - blue)) / (nir + (2 * red - blue))).toFixed(3);
        }
    },
    {
        id: 13,
        name: "Photochemical Reflectance Index",
        abbreviation: "PRI",
        formula: "(R531 − R570) / (R531 + R570)",
        purpose: "Photosynthetic activity indicator",
        category: "vegetation",
        calculate: (bands) => {
            const { r531, r570 } = bands;
            if (r531 === undefined || r570 === undefined) return null;
            return ((r531 - r570) / (r531 + r570)).toFixed(3);
        }
    },
    {
        id: 14,
        name: "Water Index",
        abbreviation: "WI",
        formula: "NIR / SWIR",
        purpose: "Detects water in plants",
        category: "water",
        calculate: (bands) => {
            const { nir, swir } = bands;
            if (nir === undefined || swir === undefined) return null;
            return (nir / swir).toFixed(3);
        }
    },
    {
        id: 15,
        name: "Transformed Vegetation Index",
        abbreviation: "TVI",
        formula: "√[(NDVI + 0.5)]",
        purpose: "Alternative to NDVI",
        category: "vegetation",
        calculate: (bands) => {
            const { nir, red } = bands;
            if (nir === undefined || red === undefined) return null;
            const ndvi = (nir - red) / (nir + red);
            return Math.sqrt(ndvi + 0.5).toFixed(3);
        }
    },
    {
        id: 16,
        name: "Normalized Difference Built-up Index",
        abbreviation: "NDBI",
        formula: "(SWIR − NIR) / (SWIR + NIR)",
        purpose: "Urban and built-up area mapping",
        category: "other",
        calculate: (bands) => {
            const { swir, nir } = bands;
            if (swir === undefined || nir === undefined) return null;
            return ((swir - nir) / (swir + nir)).toFixed(3);
        }
    },
    {
        id: 17,
        name: "Bare Soil Index",
        abbreviation: "BSI",
        formula: "[(SWIR + Red) − (NIR + Blue)] / [(SWIR + Red) + (NIR + Blue)]",
        purpose: "Identifies bare soil areas",
        category: "soil",
        calculate: (bands) => {
            const { swir, red, nir, blue } = bands;
            if (swir === undefined || red === undefined || nir === undefined || blue === undefined) return null;
            return (((swir + red) - (nir + blue)) / ((swir + red) + (nir + blue))).toFixed(3);
        }
    },
    {
        id: 18,
        name: "Chlorophyll Index Green",
        abbreviation: "CIG",
        formula: "(NIR / Green) − 1",
        purpose: "Chlorophyll measurement using green band",
        category: "vegetation",
        calculate: (bands) => {
            const { nir, green } = bands;
            if (nir === undefined || green === undefined) return null;
            return ((nir / green) - 1).toFixed(3);
        }
    },
    {
        id: 19,
        name: "Chlorophyll Index Red Edge",
        abbreviation: "CIRE",
        formula: "(NIR / RedEdge) − 1",
        purpose: "Chlorophyll estimation using red-edge band",
        category: "vegetation",
        calculate: (bands) => {
            const { nir, redEdge } = bands;
            if (nir === undefined || redEdge === undefined) return null;
            return ((nir / redEdge) - 1).toFixed(3);
        }
    },
    {
        id: 20,
        name: "Global Environmental Monitoring Index",
        abbreviation: "GEMI",
        formula: "[2(NIR² − Red²) + 1.5NIR + 0.5Red] / (NIR + Red + 0.5)",
        purpose: "Environmental monitoring with less atmospheric noise",
        category: "other",
        calculate: (bands) => {
            const { nir, red } = bands;
            if (nir === undefined || red === undefined) return null;
            return ((2 * (nir * nir - red * red) + 1.5 * nir + 0.5 * red) / (nir + red + 0.5)).toFixed(3);
        }
    }
];

// Vegetation Indices component
const VegetationIndices = ({ indices, calculatedIndices, fieldSelected }) => {
    const [activeTab, setActiveTab] = useState('all');
    
    const filteredIndices = activeTab === 'all' 
        ? indices 
        : indices.filter(index => index.category === activeTab);

    return (
        <div className="vegetation-indices-section">
            <h3><FaLeaf className="section-icon" /> Vegetation Indices</h3>
            <p className="indices-description">
                Vegetation indices are mathematical combinations of satellite spectral bands that help analyze vegetation health, 
                water content, stress levels, and other environmental factors. Select a category to filter the indices.
                {!fieldSelected && <span className="indices-note">Select a field on the map to calculate index values.</span>}
            </p>
            
            <div className="indices-tabs">
                <button 
                    className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('all')}
                >
                    All Indices
                </button>
                <button 
                    className={`tab-button ${activeTab === 'vegetation' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('vegetation')}
                >
                    <FaLeaf className="tab-icon" /> Vegetation
                </button>
                <button 
                    className={`tab-button ${activeTab === 'water' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('water')}
                >
                    <FaWater className="tab-icon" /> Water
                </button>
                <button 
                    className={`tab-button ${activeTab === 'stress' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('stress')}
                >
                    <FaChartLine className="tab-icon" /> Stress
                </button>
                <button 
                    className={`tab-button ${activeTab === 'soil' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('soil')}
                >
                    <FaSeedling className="tab-icon" /> Soil
                </button>
                <button 
                    className={`tab-button ${activeTab === 'other' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('other')}
                >
                    <FaInfoCircle className="tab-icon" /> Other
                </button>
            </div>
            
            <div className="indices-container">
                {filteredIndices.map(index => (
                    <div key={index.id} className={`index-card ${index.category} ${calculatedIndices[index.abbreviation] ? 'has-value' : ''}`}>
                        <div className="index-header">
                            <h4>{index.abbreviation}</h4>
                            <span className="index-category">{index.category}</span>
                        </div>
                        <h5>{index.name}</h5>
                        <div className="index-formula">
                            <span>Formula:</span>
                            <div className="formula-text">{index.formula}</div>
                        </div>
                        <p className="index-purpose">{index.purpose}</p>
                        {calculatedIndices[index.abbreviation] && (
                            <div className="index-value">
                                <span>Calculated Value:</span>
                                <div className="value-display">{calculatedIndices[index.abbreviation]}</div>
                                <div className="value-interpretation">
                                    {getInterpretation(index.abbreviation, calculatedIndices[index.abbreviation])}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function to interpret index values
const getInterpretation = (abbreviation, value) => {
    const numValue = parseFloat(value);
    
    switch(abbreviation) {
        case 'NDVI':
            if (numValue < 0.1) return "Very low vegetation (bare soil, water, urban)";
            if (numValue < 0.3) return "Low vegetation (sparse vegetation)";
            if (numValue < 0.6) return "Moderate vegetation (grassland, shrubs)";
            return "High vegetation (dense forest, crops)";
            
        case 'NDWI':
            if (numValue > 0.3) return "Open water";
            if (numValue > 0) return "High moisture content";
            if (numValue > -0.3) return "Moderate moisture content";
            return "Low moisture content";
            
        case 'SAVI':
            if (numValue < 0.1) return "Very low vegetation with soil influence";
            if (numValue < 0.3) return "Low vegetation with soil influence";
            if (numValue < 0.6) return "Moderate vegetation with soil influence";
            return "High vegetation with soil influence";
            
        case 'EVI':
            if (numValue < 0.2) return "Low vegetation (bare/sparse)";
            if (numValue < 0.4) return "Moderate vegetation";
            return "High vegetation (dense canopy)";
            
        case 'MSI':
            if (numValue < 0.6) return "Low water stress";
            if (numValue < 1.0) return "Moderate water stress";
            return "High water stress";
            
        case 'LAI':
            if (numValue < 1) return "Very sparse canopy";
            if (numValue < 3) return "Moderate canopy";
            if (numValue < 5) return "Dense canopy";
            return "Very dense canopy";
            
        default:
            return "Value interpretation not available";
    }
};

// Field Analysis component to display calculated indices
const FieldAnalysis = ({ calculatedIndices, fieldSelected }) => {
    return (
        <div className="field-analysis-section">
            <h3><FaCalculator className="section-icon" /> Field Analysis Results</h3>
            
            {!fieldSelected ? (
                <p className="no-data">No field selected. Draw a polygon on the map to analyze vegetation indices.</p>
            ) : (
                <>
                    <p className="analysis-intro">
                        Below are the calculated vegetation indices for your selected field. These values can help you 
                        assess vegetation health, water content, and stress levels.
                    </p>
                    
                    <div className="key-indices">
                        <div className="key-index-card">
                            <h4>NDVI</h4>
                            <div className="key-value">{calculatedIndices.NDVI || "N/A"}</div>
                            <p>Vegetation Health</p>
                            {calculatedIndices.NDVI && (
                                <div className="index-gauge">
                                    <div 
                                        className="gauge-fill" 
                                        style={{ 
                                            width: `${Math.min(Math.max(parseFloat(calculatedIndices.NDVI) * 100, 0), 100)}%`,
                                            backgroundColor: getGaugeColor('NDVI', calculatedIndices.NDVI)
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                        
                        <div className="key-index-card">
                            <h4>NDWI</h4>
                            <div className="key-value">{calculatedIndices.NDWI || "N/A"}</div>
                            <p>Water Content</p>
                            {calculatedIndices.NDWI && (
                                <div className="index-gauge">
                                    <div 
                                        className="gauge-fill" 
                                        style={{ 
                                            width: `${Math.min(Math.max((parseFloat(calculatedIndices.NDWI) + 1) * 50, 0), 100)}%`,
                                            backgroundColor: getGaugeColor('NDWI', calculatedIndices.NDWI)
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                        
                        <div className="key-index-card">
                            <h4>MSI</h4>
                            <div className="key-value">{calculatedIndices.MSI || "N/A"}</div>
                            <p>Moisture Stress</p>
                            {calculatedIndices.MSI && (
                                <div className="index-gauge">
                                    <div 
                                        className="gauge-fill" 
                                        style={{ 
                                            width: `${Math.min(Math.max(parseFloat(calculatedIndices.MSI) * 50, 0), 100)}%`,
                                            backgroundColor: getGaugeColor('MSI', calculatedIndices.MSI)
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                        
                        <div className="key-index-card">
                            <h4>LAI</h4>
                            <div className="key-value">{calculatedIndices.LAI || "N/A"}</div>
                            <p>Leaf Area</p>
                            {calculatedIndices.LAI && (
                                <div className="index-gauge">
                                    <div 
                                        className="gauge-fill" 
                                        style={{ 
                                            width: `${Math.min(Math.max(parseFloat(calculatedIndices.LAI) * 12.5, 0), 100)}%`,
                                            backgroundColor: getGaugeColor('LAI', calculatedIndices.LAI)
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="field-recommendations">
                        <h4>Field Recommendations</h4>
                        <ul>
                            {getRecommendations(calculatedIndices).map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

// Helper function to get color for gauge based on index value
const getGaugeColor = (index, value) => {
    const numValue = parseFloat(value);
    
    switch(index) {
        case 'NDVI':
            if (numValue < 0.1) return '#e74c3c'; // red
            if (numValue < 0.3) return '#f39c12'; // orange
            if (numValue < 0.6) return '#2ecc71'; // light green
            return '#27ae60'; // dark green
            
        case 'NDWI':
            if (numValue > 0.3) return '#3498db'; // blue
            if (numValue > 0) return '#2980b9'; // dark blue
            if (numValue > -0.3) return '#f39c12'; // orange
            return '#e74c3c'; // red
            
        case 'MSI':
            if (numValue < 0.6) return '#2ecc71'; // green
            if (numValue < 1.0) return '#f39c12'; // orange
            return '#e74c3c'; // red
            
        case 'LAI':
            if (numValue < 1) return '#f39c12'; // orange
            if (numValue < 3) return '#2ecc71'; // light green
            if (numValue < 5) return '#27ae60'; // dark green
            return '#1e8449'; // very dark green
            
        default:
            return '#3498db'; // default blue
    }
};

// Helper function to generate recommendations based on indices
const getRecommendations = (indices) => {
    const recommendations = [];
    
    if (indices.NDVI) {
        const ndvi = parseFloat(indices.NDVI);
        if (ndvi < 0.3) {
            recommendations.push("Vegetation is sparse. Consider increasing plant density or applying fertilizer.");
        } else if (ndvi > 0.7) {
            recommendations.push("Vegetation is very healthy. Maintain current practices.");
        }
    }
    
    if (indices.NDWI) {
        const ndwi = parseFloat(indices.NDWI);
        if (ndwi < -0.3) {
            recommendations.push("Low water content detected. Consider irrigation or water management strategies.");
        } else if (ndwi > 0.2) {
            recommendations.push("High water content detected. Monitor for potential waterlogging issues.");
        }
    }
    
    if (indices.MSI) {
        const msi = parseFloat(indices.MSI);
        if (msi > 1.0) {
            recommendations.push("High moisture stress detected. Increase irrigation frequency.");
        }
    }
    
    if (indices.LAI) {
        const lai = parseFloat(indices.LAI);
        if (lai < 2) {
            recommendations.push("Low leaf area index. Consider strategies to increase canopy development.");
        } else if (lai > 5) {
            recommendations.push("Very high leaf area index. Monitor for potential disease pressure in dense canopy.");
        }
    }
    
    // Add general recommendation if no specific ones were generated
    if (recommendations.length === 0) {
        recommendations.push("Field appears to be in good condition based on available indices.");
    }
    
    return recommendations;
};

const AgricultureDashboard = () => {
    const [area, setArea] = useState(0);
    const [weather, setWeather] = useState(null);
    const [polygonCoords, setPolygonCoords] = useState([]);
    const [mapCenter, setMapCenter] = useState([20, 77]);
    const [selectedCrop, setSelectedCrop] = useState("Wheat");
    const [stressLevel, setStressLevel] = useState("Low");
    const [precipitation, setPrecipitation] = useState("Moderate");
    const [searchedData, setSearchedData] = useState([]);
    const [activeSection, setActiveSection] = useState('map');
    const [calculatedIndices, setCalculatedIndices] = useState({});
    const [fieldSelected, setFieldSelected] = useState(false);
    const [showFieldAnalysis, setShowFieldAnalysis] = useState(false);
    const mapRef = useRef(null);

    const cropData = {
        Wheat: { yield: 3.2, phosphorus: 60, nitrogen: 120 },
        Rice: { yield: 4.5, phosphorus: 50, nitrogen: 100 },
        Corn: { yield: 5.1, phosphorus: 70, nitrogen: 140 },
        Barley: { yield: 2.8, phosphorus: 55, nitrogen: 110 },
        Maize: { yield: 6.0, phosphorus: 65, nitrogen: 130 },
        Sugarcane: { yield: 8.0, phosphorus: 80, nitrogen: 160 },
    };

    useEffect(() => {
        loadSearchHistory();
    }, []);

    // Calculate vegetation indices when a field is selected
    const calculateIndices = () => {
        // In a real application, these values would come from satellite imagery
        // For demonstration, we'll generate realistic sample values based on the crop and conditions
        
        // Base reflectance values that would typically come from satellite imagery
        let baseReflectance = {
            blue: 0.05,
            green: 0.1,
            red: 0.08,
            redEdge: 0.3,
            nir: 0.4,
            swir: 0.2,
            r531: 0.15,
            r550: 0.12,
            r570: 0.14,
            r700: 0.25
        };
        
        // Adjust reflectance based on selected crop
        switch(selectedCrop) {
            case 'Wheat':
                baseReflectance.nir *= 1.1;
                baseReflectance.red *= 0.9;
                break;
            case 'Rice':
                baseReflectance.nir *= 1.2;
                baseReflectance.swir *= 0.8;
                break;
            case 'Corn':
                baseReflectance.nir *= 1.3;
                baseReflectance.green *= 1.1;
                break;
            case 'Barley':
                baseReflectance.nir *= 1.05;
                baseReflectance.red *= 0.95;
                break;
            case 'Maize':
                baseReflectance.nir *= 1.25;
                baseReflectance.red *= 0.85;
                break;
            case 'Sugarcane':
                baseReflectance.nir *= 1.4;
                baseReflectance.red *= 0.8;
                break;
            default:
                break;
        }
        
        // Adjust reflectance based on stress level
        switch(stressLevel) {
            case 'Low':
                baseReflectance.nir *= 1.1;
                baseReflectance.red *= 0.9;
                break;
            case 'Medium':
                baseReflectance.nir *= 0.95;
                baseReflectance.red *= 1.05;
                break;
            case 'High':
                baseReflectance.nir *= 0.8;
                baseReflectance.red *= 1.2;
                break;
            default:
                break;
        }
        
        // Adjust reflectance based on precipitation
        switch(precipitation) {
            case 'Low':
                baseReflectance.swir *= 1.2;
                baseReflectance.nir *= 0.9;
                break;
            case 'Moderate':
                // No adjustment for moderate precipitation
                break;
            case 'High':
                baseReflectance.swir *= 0.8;
                baseReflectance.nir *= 1.1;
                break;
            default:
                break;
        }
        
        // Add some randomness to make it more realistic
        Object.keys(baseReflectance).forEach(key => {
            baseReflectance[key] *= (0.9 + Math.random() * 0.2); // +/- 10% random variation
            baseReflectance[key] = Math.min(Math.max(baseReflectance[key], 0), 1); // Ensure values are between 0 and 1
        });
        
        // Calculate all indices using the reflectance values
        const indices = {};
        vegetationIndices.forEach(index => {
            const value = index.calculate(baseReflectance);
            if (value !== null) {
                indices[index.abbreviation] = value;
            }
        });
        
        setCalculatedIndices(indices);
        setFieldSelected(true);
        setShowFieldAnalysis(true);
    };

    const onCreated = (e) => {
        const { layer } = e;
        const latlngs = layer.getLatLngs()[0].map((latlng) => [latlng.lng, latlng.lat]);
        latlngs.push(latlngs[0]);
        setPolygonCoords(layer.getLatLngs()[0]);
        const polygon = turf.polygon([latlngs]);
        const calculatedArea = turf.area(polygon) / 10000;
        setArea(calculatedArea.toFixed(2));
        
        // Calculate indices when a field is drawn
        calculateIndices();
    };

    const fetchWeather = async (lat, lon, locationName) => {
        const apiKey = import.meta.env.VITE_APP_ID;
        if (!apiKey) {
            console.error("API key is missing. Check your .env file.");
            return;
        }
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
            const data = await response.json();
            setWeather(data);

            const newSearch = {
                location: locationName,
                lat,
                lon,
                temperature: data.main.temp,
                humidity: data.main.humidity,
                stressLevel,
                precipitation,
            };

            await addDoc(collection(db, "searches"), newSearch);
            setTimeout(loadSearchHistory, 500);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    const loadSearchHistory = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "searches"));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSearchedData(data);
        } catch (error) {
            console.error("Error fetching search history:", error);
        }
    };

    // Recalculate indices when crop, stress level, or precipitation changes
    useEffect(() => {
        if (fieldSelected) {
            calculateIndices();
        }
    }, [selectedCrop, stressLevel, precipitation]);

    const crop = cropData[selectedCrop];
    const estimatedProduction = (area * crop.yield).toFixed(2);
    const totalPhosphorus = (area * crop.phosphorus).toFixed(2);
    const totalNitrogen = (area * crop.nitrogen).toFixed(2);

    return (
        <div className="agriculture-dashboard">
            <h2>Agriculture Dashboard</h2>
            
            <div className="dashboard-tabs">
                <button 
                    className={`dashboard-tab ${activeSection === 'map' ? 'active' : ''}`}
                    onClick={() => setActiveSection('map')}
                >
                    <FaMapMarkedAlt className="tab-icon" /> Land Analysis
                </button>
                <button 
                    className={`dashboard-tab ${activeSection === 'indices' ? 'active' : ''}`}
                    onClick={() => setActiveSection('indices')}
                >
                    <FaLeaf className="tab-icon" /> Vegetation Indices
                </button>
                {fieldSelected && (
                    <button 
                        className={`dashboard-tab ${activeSection === 'analysis' ? 'active' : ''}`}
                        onClick={() => setActiveSection('analysis')}
                    >
                        <FaCalculator className="tab-icon" /> Field Analysis
                    </button>
                )}
            </div>
            
            {activeSection === 'map' ? (
                <div className="map-section">
                    <SearchBar setMapCenter={setMapCenter} fetchWeather={fetchWeather} mapRef={mapRef} />

                    <MapContainer center={mapCenter} zoom={5} ref={mapRef} style={{ height: "400px" }}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
                        <FeatureGroup>
                            <EditControl position="topright" onCreated={onCreated} draw={{ rectangle: false, circle: false }} />
                        </FeatureGroup>
                        {polygonCoords.length > 0 && <Polygon positions={polygonCoords} color="blue" />}
                    </MapContainer>

                    <div className="area-info">
                        <p>Estimated Area: <span className="highlight-value">{area} hectares</span></p>
                    </div>
                    
                    <div className="crop-selection">
                        <h3><FaSeedling className="section-icon" /> Select Crop</h3>
                        <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                            {Object.keys(cropData).map((crop) => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="data-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Estimated Production</th>
                                    <th>Phosphorus Requirement</th>
                                    <th>Nitrogen Requirement</th>
                                    <th>Stress Level</th>
                                    <th>Precipitation Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{estimatedProduction} tonnes</td>
                                    <td>{totalPhosphorus} kg</td>
                                    <td>{totalNitrogen} kg</td>
                                    <td>
                                        <select 
                                            value={stressLevel} 
                                            onChange={(e) => setStressLevel(e.target.value)}
                                            className="inline-select"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select 
                                            value={precipitation} 
                                            onChange={(e) => setPrecipitation(e.target.value)}
                                            className="inline-select"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Moderate">Moderate</option>
                                            <option value="High">High</option>
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="soil-info">
                        <h3><FaInfoCircle className="section-icon" /> Soil Information</h3>
                        {weather && weather.main ? (
                            <div className="weather-info">
                                <p><strong>Soil Temperature:</strong> <span className="highlight-value">{weather.main.temp}°C</span></p>
                                <p><strong>Humidity:</strong> <span className="highlight-value">{weather.main.humidity}%</span></p>
                                <p><strong>Weather Condition:</strong> <span className="highlight-value">{weather.weather[0].description}</span></p>
                                <p><strong>Wind Speed:</strong> <span className="highlight-value">{weather.wind.speed} m/s</span></p>
                            </div>
                        ) : (
                            <p className="no-data">No weather data available. Search for a location to view soil information.</p>
                        )}
                    </div>
                    
                    {fieldSelected && showFieldAnalysis && (
                        <div className="field-analysis-preview">
                            <h3><FaCalculator className="section-icon" /> Field Analysis Preview</h3>
                            <p>Your field has been analyzed! Key vegetation indices have been calculated.</p>
                            <div className="preview-indices">
                                <div className="preview-index">
                                    <span>NDVI:</span> 
                                    <strong>{calculatedIndices.NDVI || "N/A"}</strong>
                                </div>
                                <div className="preview-index">
                                    <span>NDWI:</span> 
                                    <strong>{calculatedIndices.NDWI || "N/A"}</strong>
                                </div>
                                <div className="preview-index">
                                    <span>SAVI:</span> 
                                    <strong>{calculatedIndices.SAVI || "N/A"}</strong>
                                </div>
                            </div>
                            <button 
                                className="view-analysis-btn"
                                onClick={() => setActiveSection('analysis')}
                            >
                                View Full Analysis
                            </button>
                        </div>
                    )}
                </div>
            ) : activeSection === 'indices' ? (
                <VegetationIndices 
                    indices={vegetationIndices} 
                    calculatedIndices={calculatedIndices}
                    fieldSelected={fieldSelected}
                />
            ) : (
                <FieldAnalysis 
                    calculatedIndices={calculatedIndices}
                    fieldSelected={fieldSelected}
                />
            )}
        </div>
    );
};

export default AgricultureDashboard;
