// src/components/AdminMap.jsx

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMap } from 'react-leaflet/hooks';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import leaflet CSS

// --- Custom Icons for Markers ---
// Standard marker icon
const iconDefault = new L.Icon({
  iconUrl: '/marker-icon-selected.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// A different, more prominent icon for the selected marker
const iconSelected = new L.Icon({
  iconUrl: '/marker-icon-selected.png', // You'll need to add this image to your /public folder
  shadowUrl: '/marker-shadow.png',
  iconSize: [35, 57], // Larger size
  iconAnchor: [17, 56],
  popupAnchor: [1, -48],
  shadowSize: [57, 57],
});


// This is a helper component that allows us to control the map from the parent
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};


const AdminMap = ({ reports, selectedReport }) => {
  // Use a more central location for Greater Noida as the default
  const defaultPosition = [28.4744, 77.5040];

  // Filter reports to ensure they have valid location data
  const reportsWithCoords = reports.filter(
    (report) => report?.location?.coordinates?.length === 2
  );

  // Determine the map's center based on the selected report
  const mapCenter = selectedReport?.location?.coordinates
    ? [selectedReport.location.coordinates[1], selectedReport.location.coordinates[0]] // Reverse for Leaflet [lat, lng]
    : defaultPosition;

  return (
    // Replaced the external CSS class with Tailwind CSS for consistency
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false} // Often better for embedded maps
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {reportsWithCoords.map((report) => {
          const isSelected = selectedReport?._id === report._id;
          return (
            <Marker
              key={report._id}
              position={[
                report.location.coordinates[1], // Latitude
                report.location.coordinates[0], // Longitude
              ]}
              // Use a different icon if the marker is selected
              icon={isSelected ? iconSelected : iconDefault}
              // Make the selected marker rise to the top
              zIndexOffset={isSelected ? 1000 : 0}
            >
              <Popup>
                <div className="text-base font-sans">
                  <h4 className="font-bold">{report.title}</h4>
                  <p>Category: {report.category}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* This component will handle flying to the new center */}
        <MapUpdater center={mapCenter} zoom={15} />
      </MapContainer>
    </div>
  );
};

export default AdminMap;