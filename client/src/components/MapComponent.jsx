import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ labours = [], onBook }) => {
    const safeLabours = Array.isArray(labours) ? labours : [];
    const center = [28.6139, 77.2090]; // Default New Delhi

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
            <MapContainer center={center} zoom={11} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {safeLabours.map((labour) => {
                    // Safety check for coordinates, default/randomize if missing for demo
                    const position = labour.coordinates || [
                        28.6139 + (Math.random() - 0.5) * 0.1,
                        77.2090 + (Math.random() - 0.5) * 0.1
                    ];

                    return (
                        <Marker key={labour._id || labour.id} position={position}>
                            <Popup>
                                <div className="text-center p-1 min-w-[150px]">
                                    <div className="flex flex-col items-center mb-2">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-1">
                                            {labour.username?.[0]}
                                        </div>
                                        <h3 className="font-bold text-gray-800">{labour.username}</h3>
                                        <p className="text-xs text-gray-500">{labour.profession}</p>
                                    </div>

                                    <p className="text-primary font-bold text-lg mb-2">₹{labour.rate}/hr</p>

                                    <button
                                        onClick={() => onBook(labour)}
                                        className="w-full bg-secondary text-white text-xs py-2 rounded-lg font-bold hover:bg-secondaryLight transition-colors"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
