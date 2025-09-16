// src/components/AdminMap.jsx

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Import leaflet marker images directly
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AdminMap = ({ reports }) => {
  const defaultPosition = [28.6139, 77.2090]; // Delhi, India

  return (
    <div className="h-[500px] w-full mb-6 shadow-lg rounded-lg">
      <MapContainer center={defaultPosition} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {reports.map((report) => (
          <Marker
            key={report._id}
            position={[
              report.location.coordinates[1],
              report.location.coordinates[0],
            ]}
          >
            <Popup>
              <div className="w-48">
                <h4 className="font-bold text-md">{report.title}</h4>
                <p className="text-sm text-gray-600">Category: {report.category}</p>
                <p className="text-sm text-gray-600">Status: {report.status}</p>
                {report.mediaUrls[0] && (
                  <img
                    src={`http://localhost:5001${report.mediaUrls[0]}`}
                    alt={report.title}
                    className="mt-2 w-full h-auto rounded-md"
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
