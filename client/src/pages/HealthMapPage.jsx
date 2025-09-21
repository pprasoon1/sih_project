import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import mockZones from '../mock/mockZones.json';

const HealthMapPage = () => {
  const [zones, setZones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setZones(mockZones);
      setLoading(false);
    }, 1000);
  }, []);

  const getZoneColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getZoneStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const styleZone = (feature) => {
    return {
      fillColor: getZoneColor(feature.properties.healthScore),
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };
  
  const onEachZone = (zone, layer) => {
    layer.bindPopup(`
      <div class="p-4">
        <h3 class="font-semibold text-lg mb-2">${zone.properties.name}</h3>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium">Health Score:</span>
            <span class="font-bold text-lg">${zone.properties.healthScore}/100</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium">Status:</span>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${
              zone.properties.healthScore >= 80 ? 'bg-green-100 text-green-800' :
              zone.properties.healthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              zone.properties.healthScore >= 40 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }">${getZoneStatus(zone.properties.healthScore)}</span>
          </div>
          <div class="text-sm text-gray-600">
            Reports: ${zone.properties.reportCount || 0}
          </div>
        </div>
      </div>
    `);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading health map...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Civic Health Map</h1>
              <p className="text-gray-600">Visualize community health scores across different zones</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="card-body p-0">
                <div className="h-96 lg:h-[600px]">
                  <MapContainer 
                    center={[28.4595, 77.5076]} 
                    zoom={12} 
                    style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                    className="z-0"
                  >
                    <TileLayer 
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {zones && (
                      <GeoJSON 
                        data={zones} 
                        style={styleZone} 
                        onEachFeature={onEachZone} 
                      />
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend */}
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Score Legend</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Excellent (80-100)</div>
                      <div className="text-xs text-gray-600">Well-maintained areas</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Good (60-79)</div>
                      <div className="text-xs text-gray-600">Generally good condition</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Fair (40-59)</div>
                      <div className="text-xs text-gray-600">Some issues present</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Needs Attention (0-39)</div>
                      <div className="text-xs text-gray-600">Requires immediate action</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Stats */}
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Statistics</h3>
                <div className="space-y-4">
                  {zones?.features?.slice(0, 5).map((zone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{zone.properties.name}</div>
                        <div className="text-sm text-gray-600">{zone.properties.reportCount || 0} reports</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          zone.properties.healthScore >= 80 ? 'text-green-600' :
                          zone.properties.healthScore >= 60 ? 'text-yellow-600' :
                          zone.properties.healthScore >= 40 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {zone.properties.healthScore}
                        </div>
                        <div className="text-xs text-gray-500">score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Take Action</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => window.location.href = '/dashboard'} 
                    className="btn btn-primary btn-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Report an Issue
                  </button>
                  <button 
                    onClick={() => window.location.href = '/feed'} 
                    className="btn btn-outline btn-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    View Community Feed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8">
          <div className="card">
            <div className="card-body">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Data</h3>
                  <p className="text-sm text-gray-600">Health scores are updated based on recent reports and resolution status</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Community Impact</h3>
                  <p className="text-sm text-gray-600">Your reports directly influence the health scores of your neighborhood</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transparency</h3>
                  <p className="text-sm text-gray-600">Open data helps everyone understand community needs and progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMapPage;