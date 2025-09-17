// src/components/AdminMap.jsx

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Import leaflet marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default icon issue which is a common problem with React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AdminMap = ({ reports }) => {
  const defaultPosition = [28.6139, 77.2090]; // Default to Delhi, India

  // **THE FIX IS HERE:** We first filter the reports to ensure they have valid location data.
  const reportsWithCoords = reports.filter(
    (report) =>
      report.location &&
      report.location.coordinates &&
      report.location.coordinates.length === 2
  );

  return (
    <div className="map-container-style">
      <MapContainer
        center={defaultPosition}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Now, we map over the *filtered* list of reports */}
        {reportsWithCoords.map((report) => (
          <Marker
            key={report._id}
            // Leaflet expects [latitude, longitude]
            // Your schema stores [longitude, latitude], so we reverse it here.
            position={[
              report.location.coordinates[1], // Latitude
              report.location.coordinates[0], // Longitude
            ]}
          >
            <Popup>
              <div className="popup-container">
                <h4 className="popup-title">{report.title}</h4>
                <p className="popup-text">Category: {report.category}</p>
                <p className="popup-text">Status: {report.status}</p>
                {report.mediaUrls && report.mediaUrls[0] && (
                  <img
                    src={`http://localhost:5001${report.mediaUrls[0]}`}
                    alt={report.title}
                    className="popup-image"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AdminMap;