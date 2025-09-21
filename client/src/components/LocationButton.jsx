import React, { useState } from 'react';

const LocationButton = ({ onLocationShare, disabled }) => {
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const handleLocationClick = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser');
            return;
        }

        setIsGettingLocation(true);
        
        try {
            await onLocationShare();
        } catch (error) {
            console.error('Location error:', error);
        } finally {
            setIsGettingLocation(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleLocationClick}
            disabled={disabled || isGettingLocation}
            className="location-button"
        >
            {isGettingLocation ? (
                <>
                    <span className="location-spinner"></span>
                    Getting Location...
                </>
            ) : (
                <>
                    📍 Share My Location
                </>
            )}
        </button>
    );
};

export default LocationButton;