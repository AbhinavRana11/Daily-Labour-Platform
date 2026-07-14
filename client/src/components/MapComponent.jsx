import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Helper for professional emojis
const getProfessionEmoji = (profession) => {
    switch (profession?.toLowerCase()) {
        case 'plumber': return '🚰';
        case 'electrician': return '🔧';
        case 'carpenter': return '🛠';
        case 'housekeeper':
        case 'cleaner': return '🧹';
        case 'mason': return '🧱';
        case 'painter': return '🎨';
        default: return '👷';
    }
};

// Create emoji Leaflet Icon
const createEmojiIcon = (emoji, isSelected) => {
    return L.divIcon({
        html: `<div class="${isSelected ? 'animate-bounce' : ''}" style="font-size: ${isSelected ? '30px' : '26px'}; line-height: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4)); text-align: center; cursor: pointer; transition: all 0.2s; ${isSelected ? 'background: #ffffff; border: 2px solid #F59E0B; padding: 4px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px;' : ''}">${emoji}</div>`,
        iconSize: isSelected ? [42, 42] : [32, 32],
        iconAnchor: isSelected ? [21, 21] : [16, 16]
    });
};

// Custom Blue Dot Customer Icon
const customerIcon = L.divIcon({
    html: `<div style="width: 22px; height: 22px; border-radius: 50%; background-color: #2563EB; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; position: relative;">
             <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping" style="top:0; left:0; transform: scale(1.4);"></span>
           </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

// Haversine formula to compute distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; 
    return d.toFixed(1);
};

// Sub-component to programmatically handle centering and zoom
const MapRecenter = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

const MapComponent = ({ labours = [], customerLoc, selectedLabour, searchRadius = 5, onBook = () => {} }) => {
    const safeLabours = Array.isArray(labours) ? labours : [];
    
    // Default Map Center
    const defaultCenter = [28.6139, 77.2090]; // New Delhi
    const center = customerLoc ? [customerLoc.lat, customerLoc.lng] : defaultCenter;
    const mapZoom = customerLoc ? 13 : 11;

    // Get position array for selected labour
    let selectedPosition = null;
    if (selectedLabour && selectedLabour.location && Array.isArray(selectedLabour.location.coordinates)) {
        const [lng, lat] = selectedLabour.location.coordinates;
        selectedPosition = [lat, lng];
    }

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer center={center} zoom={mapZoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Map Recenter Action */}
                <MapRecenter center={center} zoom={mapZoom} />

                {/* Customer Location Blue Pin */}
                {customerLoc && (
                    <Marker position={[customerLoc.lat, customerLoc.lng]} icon={customerIcon}>
                        <Popup>
                            <div className="text-center font-bold text-xs p-1">
                                🔵 You are here
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Search Radius Circle (Step 12) */}
                {customerLoc && (
                    <Circle
                        center={[customerLoc.lat, customerLoc.lng]}
                        radius={searchRadius * 1000} // in meters
                        pathOptions={{
                            color: '#F59E0B',
                            fillColor: '#F59E0B',
                            fillOpacity: 0.08,
                            weight: 2,
                            dashArray: '5, 8'
                        }}
                    />
                )}

                {/* Worker Markers */}
                {safeLabours.map((labour) => {
                    // Extract coordinates
                    let position = null;
                    if (labour.location && Array.isArray(labour.location.coordinates) && labour.location.coordinates.length === 2) {
                        const [lng, lat] = labour.location.coordinates;
                        position = [lat, lng];
                    }

                    if (!position) return null;

                    const emoji = getProfessionEmoji(labour.profession);
                    const isSelected = selectedLabour && selectedLabour._id === labour._id;

                    // Calculate distance from customer
                    const distanceStr = customerLoc 
                        ? `${calculateDistance(customerLoc.lat, customerLoc.lng, position[0], position[1])} KM Away`
                        : '';

                    return (
                        <Marker 
                            key={labour._id || labour.id} 
                            position={position}
                            icon={createEmojiIcon(emoji, isSelected)}
                        >
                            <Popup>
                                <div className="text-center p-1 min-w-[170px] space-y-2">
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl mb-1">{emoji}</div>
                                        <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                                            {labour.username}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                            {labour.profession}
                                        </p>
                                        {distanceStr && (
                                            <span className="text-[10px] font-bold text-primary bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/50 mt-1">
                                                {distanceStr}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-semibold px-2 py-1.5 bg-slate-50 rounded-lg">
                                        <span className="text-slate-500">Rate:</span>
                                        <span className="font-extrabold text-slate-800">₹{labour.rate}/hr</span>
                                    </div>

                                    <button
                                        onClick={() => onBook(labour)}
                                        className="w-full bg-primary hover:bg-primaryDark text-white text-xs py-2 rounded-lg font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                                    >
                                        Book {labour.username.split(' ')[0]}
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Polyline Route direction (Step 11) */}
                {customerLoc && selectedPosition && (
                    <Polyline
                        positions={[
                            [customerLoc.lat, customerLoc.lng],
                            selectedPosition
                        ]}
                        pathOptions={{
                            color: '#2563EB',
                            weight: 3,
                            opacity: 0.85,
                            dashArray: '10, 10'
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
