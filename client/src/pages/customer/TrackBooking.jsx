import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Phone, MessageSquare, Star, ShieldCheck,
    Share2, RefreshCw, MapPin, ChevronUp, ChevronDown,
    Briefcase, Clock, Navigation2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UberTrackingMap from '../../components/UberTrackingMap';
import ChatModal from '../../components/ChatModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getAvatarUrl = (username = '') => {
    const avatars = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    ];
    const idx = Math.abs(username.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % avatars.length;
    return avatars[idx];
};

const STATUS_META = {
    pending:         { label: 'Waiting for Worker',   color: '#F59E0B', step: 0 },
    accepted:        { label: 'Worker Accepted',       color: '#3B82F6', step: 1 },
    on_the_way:      { label: 'Worker On the Way',     color: '#8B5CF6', step: 2 },
    arrived:         { label: 'Worker Nearby',         color: '#F97316', step: 3 },
    reached_arrived: { label: 'Worker Arrived',        color: '#10B981', step: 4 },
    arrived_reached: { label: 'Worker Arrived',        color: '#10B981', step: 4 },
    started:         { label: 'Work in Progress',      color: '#06B6D4', step: 5 },
    working:         { label: 'Work in Progress',      color: '#06B6D4', step: 5 },
    completed:       { label: 'Work Completed ✓',      color: '#10B981', step: 6 },
};

const STEPS = ['Requested', 'Accepted', 'On Way', 'Nearby', 'Arrived', 'Working', 'Done'];

// Fetch road route from OSRM (free, no key)
const fetchOSRMRoute = async (from, to) => {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates;
            return coords.map(([lng, lat]) => [lat, lng]);
        }
    } catch (e) {
        console.warn('OSRM route failed, using fallback:', e);
    }
    return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TrackBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, socket } = useAuth();

    const [booking, setBooking] = useState(null);
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [routeCoords, setRouteCoords] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [sheetExpanded, setSheetExpanded] = useState(false);
    const [etaSec, setEtaSec] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState(null);

    // Locations
    const [customerLoc, setCustomerLoc] = useState({ lat: 28.6139, lng: 77.2090 });
    const [workerLoc, setWorkerLoc] = useState(null);

    const movingTimerRef = useRef(null);

    // ── Fetch route whenever worker or customer loc changes ──────────────────
    const updateRoute = useCallback(async (wLoc, cLoc) => {
        if (!wLoc || !cLoc) return;
        const coords = await fetchOSRMRoute(wLoc, cLoc);
        setRouteCoords(coords);
    }, []);

    // ── Fetch tracking info from backend ─────────────────────────────────────
    const fetchTrackingDetails = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/tracking/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const info = res.data;
            setTrackingInfo(info);

            const newWorker = { lat: info.latitude, lng: info.longitude };
            const newCustomer = info.customerLocation || customerLoc;

            setWorkerLoc(prev => {
                const changed = !prev || prev.lat !== newWorker.lat || prev.lng !== newWorker.lng;
                if (changed) {
                    setIsMoving(true);
                    clearTimeout(movingTimerRef.current);
                    movingTimerRef.current = setTimeout(() => setIsMoving(false), 3000);
                }
                return newWorker;
            });
            setCustomerLoc(newCustomer);
            await updateRoute(newWorker, newCustomer);
        } catch (err) {
            console.error('Tracking fetch error:', err);
        }
    }, [id, customerLoc, updateRoute]);

    // ── Initial data fetch ───────────────────────────────────────────────────
    useEffect(() => {
        if (!user) { navigate('/login'); return; }

        const init = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBooking(res.data);
                await fetchTrackingDetails();
            } catch (err) {
                console.error('Booking fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        init();

        // ETA ticker
        const ticker = setInterval(() => setEtaSec(s => s + 1), 1000);

        return () => {
            clearInterval(ticker);
            clearTimeout(movingTimerRef.current);
        };
    }, [id, user]);

    // ── Socket listeners ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const onStatusUpdate = (updated) => {
            if (updated._id === id) {
                setBooking(updated);
                setEtaSec(0);
                if (updated.status === 'completed') {
                    setTimeout(() => navigate(`/customer/booking-details/${id}`), 2500);
                }
            }
        };

        const onLocationUpdate = async ({ bookingId, latitude, longitude }) => {
            if (bookingId !== id) return;
            const newWorker = { lat: latitude, lng: longitude };
            setWorkerLoc(newWorker);
            setIsMoving(true);
            setEtaSec(0);
            clearTimeout(movingTimerRef.current);
            movingTimerRef.current = setTimeout(() => setIsMoving(false), 3000);
            await updateRoute(newWorker, customerLoc);
        };

        socket.on('booking_status_update', onStatusUpdate);
        socket.on('workerLocationUpdated', onLocationUpdate);

        return () => {
            socket.off('booking_status_update', onStatusUpdate);
            socket.off('workerLocationUpdated', onLocationUpdate);
        };
    }, [socket, id, customerLoc, updateRoute, navigate]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleOpenChat = () => {
        if (!booking?.labour) return;
        const ids = [user._id, booking.labour._id].sort();
        setChatRecipient({ ...booking.labour, chatId: ids.join('_') });
        setIsChatOpen(true);
    };

    const handleCancel = async () => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/cancel/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/customer/bookings');
        } catch { alert('Could not cancel. Try again.'); }
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 gap-5">
                <div className="w-14 h-14 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                <p className="text-slate-300 font-semibold text-sm tracking-wider animate-pulse">
                    Locating your worker...
                </p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
                <MapPin className="w-12 h-12 text-slate-600" />
                <h3 className="text-xl font-bold">Booking not found</h3>
                <button onClick={() => navigate('/customer/bookings')}
                    className="px-6 py-2.5 bg-blue-600 rounded-full font-semibold text-sm cursor-pointer">
                    Go Back
                </button>
            </div>
        );
    }

    const statusMeta = STATUS_META[booking.status] || STATUS_META.accepted;
    const currentStep = statusMeta.step;
    const eta = trackingInfo?.eta || Math.max(1, 15 - Math.floor(etaSec / 60));
    const distance = trackingInfo?.distance || 2.3;
    const avatar = getAvatarUrl(booking.labour?.username);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col overflow-hidden" style={{ top: '64px' }}>

            {/* ── Full-screen Map ── */}
            <div className="flex-1 relative">
                <UberTrackingMap
                    workerLoc={workerLoc || { lat: 28.6200, lng: 77.2150 }}
                    customerLoc={customerLoc}
                    profession={booking.labour?.profession}
                    labour={booking.labour}
                    routeCoords={routeCoords}
                    isMoving={isMoving}
                />

                {/* Back button */}
                <button
                    onClick={() => navigate('/customer/bookings')}
                    className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-white" />
                </button>

                {/* ── Top ETA badge ── */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
                    <div className="flex items-center gap-2.5 bg-slate-900/95 backdrop-blur border border-slate-700/50 rounded-2xl px-4 py-2.5 shadow-2xl">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ETA</p>
                            <p className="text-white font-black text-base leading-none">{eta} min</p>
                        </div>
                        <div className="w-px h-8 bg-slate-700" />
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distance</p>
                            <p className="text-white font-black text-base leading-none">{distance} km</p>
                        </div>
                        <div className="w-px h-8 bg-slate-700" />
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</p>
                            <p className="font-black text-xs leading-none" style={{ color: statusMeta.color }}>
                                {booking.status.replace(/_/g, ' ')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Live badge */}
                {isMoving && (
                    <div className="absolute top-4 right-4 z-[1000]">
                        <div className="flex items-center gap-1.5 bg-blue-600/90 backdrop-blur border border-blue-500/50 rounded-full px-3 py-1.5 shadow-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            <span className="text-white font-black text-[10px] uppercase tracking-wider">Moving</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Sheet ── */}
            <div
                className="relative z-[1000] bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl transition-all duration-500 ease-out"
                style={{ maxHeight: sheetExpanded ? '70vh' : '280px', overflowY: sheetExpanded ? 'auto' : 'hidden' }}
            >
                {/* Drag handle */}
                <div
                    className="flex flex-col items-center pt-3 pb-1 cursor-pointer"
                    onClick={() => setSheetExpanded(e => !e)}
                >
                    <div className="w-10 h-1 bg-slate-700 rounded-full mb-2" />
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        {sheetExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                        {sheetExpanded ? 'Collapse' : 'More Details'}
                    </div>
                </div>

                <div className="px-5 pb-6 space-y-4">

                    {/* Status headline */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Worker Status</p>
                            <h3 className="text-white font-black text-lg leading-tight" style={{ color: statusMeta.color }}>
                                {statusMeta.label}
                            </h3>
                        </div>
                        <button
                            onClick={fetchTrackingDetails}
                            className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-750 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    {/* Progress bar steps */}
                    <div className="relative">
                        <div className="flex items-center justify-between relative">
                            {/* Track line */}
                            <div className="absolute left-0 right-0 h-0.5 bg-slate-800 top-3 z-0" />
                            <div
                                className="absolute left-0 h-0.5 top-3 z-0 transition-all duration-700"
                                style={{
                                    width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                                    background: `linear-gradient(90deg, ${statusMeta.color}, ${statusMeta.color}88)`
                                }}
                            />
                            {STEPS.map((label, i) => (
                                <div key={i} className="flex flex-col items-center z-10 gap-1.5">
                                    <div
                                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all duration-500"
                                        style={{
                                            background: i <= currentStep ? statusMeta.color : '#1e293b',
                                            borderColor: i <= currentStep ? statusMeta.color : '#334155',
                                            color: i <= currentStep ? 'white' : '#475569',
                                            transform: i === currentStep ? 'scale(1.25)' : 'scale(1)',
                                            boxShadow: i === currentStep ? `0 0 12px ${statusMeta.color}66` : 'none'
                                        }}
                                    >
                                        {i < currentStep ? '✓' : i + 1}
                                    </div>
                                    <span
                                        className="text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
                                        style={{ color: i <= currentStep ? statusMeta.color : '#475569' }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Worker card */}
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                                <img
                                    src={avatar}
                                    alt=""
                                    className="w-14 h-14 rounded-xl object-cover"
                                />
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-white font-black text-base truncate">
                                        {booking.labour?.username || 'Worker'}
                                    </h4>
                                    <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                                        {booking.labour?.profession}
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400">
                                        <Star className="w-3 h-3 fill-amber-400" />
                                        {booking.labour?.rating || '4.9'}
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-[11px] font-bold text-slate-400">
                                        {booking.labour?.experience || 5} yrs
                                    </span>
                                </div>
                            </div>
                            {/* Quick actions */}
                            <div className="flex gap-2 flex-shrink-0">
                                <a
                                    href={`tel:${booking.labour?.phone || ''}`}
                                    className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center hover:bg-green-500/20 transition-colors"
                                >
                                    <Phone className="w-4 h-4 text-green-400" />
                                </a>
                                <button
                                    onClick={handleOpenChat}
                                    className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                </button>
                            </div>
                        </div>

                        {/* Expanded details */}
                        {sheetExpanded && (
                            <div className="mt-4 space-y-3 pt-3 border-t border-slate-700/50">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Jobs Done</p>
                                        <p className="text-white font-black text-lg mt-0.5">{booking.labour?.completedJobs || 240}</p>
                                    </div>
                                    <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rate/hr</p>
                                        <p className="text-white font-black text-lg mt-0.5">₹{booking.labour?.rate || 400}</p>
                                    </div>
                                    <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Service</p>
                                        <p className="text-blue-400 font-black text-sm mt-0.5 capitalize">{booking.service || booking.labour?.profession}</p>
                                    </div>
                                    <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Booking ID</p>
                                        <p className="text-slate-400 font-bold text-[10px] mt-0.5 font-mono">{id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/customer/worker-profile/${booking.labour?._id}`)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    View Full Profile
                                </button>

                                {['pending', 'accepted', 'on_the_way'].includes(booking.status) && (
                                    <button
                                        onClick={handleCancel}
                                        className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-sm border border-red-500/20 cursor-pointer transition-colors"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat modal */}
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipient={chatRecipient}
                booking={booking}
            />
        </div>
    );
};

export default TrackBooking;
