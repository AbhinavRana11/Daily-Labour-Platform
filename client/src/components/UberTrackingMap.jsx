import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ─── Custom Icons ───────────────────────────────────────────────────────────

const customerIcon = L.divIcon({
    className: '',
    html: `
        <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
            <span style="position:absolute; width:52px; height:52px; border-radius:50%; background:rgba(37,99,235,0.25); top:50%; left:50%; transform:translate(-50%,-50%); animation: uberPing 1.8s ease-out infinite;"></span>
            <span style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(37,99,235,0.18); top:50%; left:50%; transform:translate(-50%,-50%); animation: uberPing 1.8s ease-out infinite 0.4s;"></span>
            <div style="width:22px; height:22px; border-radius:50%; background:#2563EB; border:3px solid white; box-shadow:0 2px 12px rgba(37,99,235,0.7); z-index:1;"></div>
        </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const createWorkerIcon = (profession, isMoving) => {
    const emojiMap = {
        plumber: '🚰', electrician: '⚡', carpenter: '🛠️',
        cleaner: '🧹', housekeeper: '🧹', mason: '🧱',
        painter: '🎨', driver: '🚗', default: '👷'
    };
    const emoji = emojiMap[(profession || '').toLowerCase()] || emojiMap.default;

    return L.divIcon({
        className: '',
        html: `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                ${isMoving ? `<span style="position:absolute; width:50px; height:50px; border-radius:50%; background:rgba(245,158,11,0.2); top:-10px; left:50%; transform:translateX(-50%); animation: uberPing 1.4s ease-out infinite;"></span>` : ''}
                <div style="
                    width:46px; height:46px; border-radius:50%;
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 3px solid ${isMoving ? '#F59E0B' : '#334155'};
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 2px ${isMoving ? 'rgba(245,158,11,0.3)' : 'transparent'};
                    display:flex; align-items:center; justify-content:center;
                    font-size:22px; z-index:2;
                    transition: border-color 0.3s;
                ">
                    ${emoji}
                </div>
                <div style="
                    width:0; height:0;
                    border-left: 7px solid transparent;
                    border-right: 7px solid transparent;
                    border-top: 9px solid ${isMoving ? '#F59E0B' : '#334155'};
                    margin-top:-2px;
                "></div>
            </div>
        `,
        iconSize: [46, 60],
        iconAnchor: [23, 60]
    });
};

const destinationIcon = L.divIcon({
    className: '',
    html: `
        <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="
                width:18px; height:18px; border-radius:50%;
                background:#10B981; border:3px solid white;
                box-shadow:0 2px 8px rgba(16,185,129,0.6);
            "></div>
            <div style="width:2px; height:12px; background:#10B981; margin-top:-1px;"></div>
        </div>
    `,
    iconSize: [18, 32],
    iconAnchor: [9, 32]
});

// ─── Animate marker smoothly ─────────────────────────────────────────────────
const lerp = (start, end, t) => start + (end - start) * t;

const useAnimatedMarker = (markerRef, targetLoc) => {
    const animFrameRef = useRef(null);
    const startLocRef = useRef(null);
    const startTimeRef = useRef(null);
    const DURATION = 2000; // ms

    useEffect(() => {
        if (!markerRef.current || !targetLoc) return;

        const marker = markerRef.current;
        const currentPos = marker.getLatLng();
        startLocRef.current = { lat: currentPos.lat, lng: currentPos.lng };
        startTimeRef.current = performance.now();

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        const animate = (now) => {
            const elapsed = now - startTimeRef.current;
            const t = Math.min(elapsed / DURATION, 1);
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease in-out quad

            const lat = lerp(startLocRef.current.lat, targetLoc.lat, eased);
            const lng = lerp(startLocRef.current.lng, targetLoc.lng, eased);
            marker.setLatLng([lat, lng]);

            if (t < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, [targetLoc]);
};

// ─── Auto-fit bounds ─────────────────────────────────────────────────────────
const AutoFitBounds = ({ workerLoc, customerLoc }) => {
    const map = useMap();
    const fittedRef = useRef(false);

    useEffect(() => {
        if (!workerLoc || !customerLoc) return;
        if (fittedRef.current) return; // only fit once on load

        const bounds = L.latLngBounds(
            [workerLoc.lat, workerLoc.lng],
            [customerLoc.lat, customerLoc.lng]
        );
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true, duration: 1.2 });
        fittedRef.current = true;
    }, [workerLoc, customerLoc, map]);

    return null;
};

// ─── Animated Worker Marker ──────────────────────────────────────────────────
const AnimatedWorkerMarker = ({ workerLoc, profession, isMoving, labour }) => {
    const markerRef = useRef(null);
    useAnimatedMarker(markerRef, workerLoc);

    if (!workerLoc) return null;

    return (
        <Marker
            ref={markerRef}
            position={[workerLoc.lat, workerLoc.lng]}
            icon={createWorkerIcon(profession, isMoving)}
        >
            <Popup>
                <div style={{ textAlign: 'center', padding: '4px', minWidth: '120px' }}>
                    <strong>{labour?.username || 'Worker'}</strong><br />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{profession}</span>
                </div>
            </Popup>
        </Marker>
    );
};

// ─── Main Map Component ──────────────────────────────────────────────────────
const UberTrackingMap = ({ workerLoc, customerLoc, profession, labour, routeCoords, isMoving }) => {
    const defaultCenter = customerLoc
        ? [customerLoc.lat, customerLoc.lng]
        : [28.6139, 77.2090];

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <style>{`
                @keyframes uberPing {
                    0% { transform: translate(-50%,-50%) scale(0.5); opacity:0.8; }
                    100% { transform: translate(-50%,-50%) scale(2); opacity:0; }
                }
            `}</style>
            <MapContainer
                center={defaultCenter}
                zoom={14}
                scrollWheelZoom={true}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                {/* Dark Carto tiles — premium Uber-like look */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    subdomains="abcd"
                    maxZoom={20}
                />

                {/* Auto fit bounds on load */}
                <AutoFitBounds workerLoc={workerLoc} customerLoc={customerLoc} />

                {/* Customer (You) marker */}
                {customerLoc && (
                    <Marker
                        position={[customerLoc.lat, customerLoc.lng]}
                        icon={customerIcon}
                    >
                        <Popup>
                            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                                📍 Your Location
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Destination pin at customer */}
                {customerLoc && (
                    <Marker
                        position={[customerLoc.lat + 0.0001, customerLoc.lng]}
                        icon={destinationIcon}
                        interactive={false}
                    />
                )}

                {/* Animated Worker Marker */}
                <AnimatedWorkerMarker
                    workerLoc={workerLoc}
                    profession={profession}
                    isMoving={isMoving}
                    labour={labour}
                />

                {/* Road route polyline from OSRM */}
                {routeCoords && routeCoords.length > 1 && (
                    <>
                        {/* Glow effect */}
                        <Polyline
                            positions={routeCoords}
                            pathOptions={{
                                color: '#3B82F6',
                                weight: 10,
                                opacity: 0.2,
                            }}
                        />
                        {/* Main route */}
                        <Polyline
                            positions={routeCoords}
                            pathOptions={{
                                color: '#60A5FA',
                                weight: 4,
                                opacity: 0.95,
                            }}
                        />
                    </>
                )}

                {/* Fallback straight line */}
                {(!routeCoords || routeCoords.length < 2) && workerLoc && customerLoc && (
                    <Polyline
                        positions={[
                            [workerLoc.lat, workerLoc.lng],
                            [customerLoc.lat, customerLoc.lng]
                        ]}
                        pathOptions={{
                            color: '#60A5FA',
                            weight: 3,
                            opacity: 0.7,
                            dashArray: '10, 8'
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default UberTrackingMap;
