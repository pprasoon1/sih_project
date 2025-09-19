import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import mockZones from '../mock/mockZones.json'; // We'll use mock data for the UI

const HealthMapPage = () => {
    const [zones, setZones] = useState(null);

    useEffect(() => {
        // In a real app, you would fetch this from GET /api/public/health-scores
        setZones(mockZones);
    }, []);

    const getZoneColor = (score) => {
        if (score >= 80) return '#28a745'; // Green
        if (score >= 50) return '#ffc107'; // Yellow
        return '#dc3545'; // Red
    };

    const styleZone = (feature) => {
        return {
            fillColor: getZoneColor(feature.properties.healthScore),
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.6
        };
    };
    
    const onEachZone = (zone, layer) => {
        layer.bindPopup(`
            <b>Zone: ${zone.properties.name}</b><br/>
            Health Score: ${zone.properties.healthScore}/100
        `);
    };

    return (
        <div className="health-map-container">
            <h1>Civic Health Map</h1>
            <MapContainer center={[28.4595, 77.5076]} zoom={12} style={{ height: '70vh', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {zones && <GeoJSON data={zones} style={styleZone} onEachFeature={onEachZone} />}
                {/* TODO: Add a Legend component */}
            </MapContainer>
        </div>
    );
};
export default HealthMapPage;