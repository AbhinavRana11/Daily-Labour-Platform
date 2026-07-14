import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, Clock, DollarSign, MapPin, Check, 
    ArrowLeft, Navigation, Phone, MessageSquare, Play, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from '../../components/ChatModal';

const TodayJobs = () => {
    const { user, socket } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tracking states
    const [trackingBookingId, setTrackingBookingId] = useState(null);
    const [watchId, setWatchId] = useState(null);

    // Modals
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState(null);
    const [chatBooking, setChatBooking] = useState(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter accepted or progress jobs
            setBookings(res.data.filter(b => 
                ['accepted', 'on_the_way', 'arrived', 'working', 'started'].includes(b.status)
            ));
        } catch (err) {
            console.error("Error loading today schedule:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchJobs();

        return () => {
            // Clean up GPS tracking watch on unmount
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [user, navigate]);

    // Handle timeline status transition transitions
    const handleStatusTransition = async (bookingId, nextStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, {
                status: nextStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setBookings(prev => prev.map(b => b._id === bookingId ? res.data : b));

            // Socket status emit
            if (socket) {
                socket.emit("booking_status_update", res.data);
            }

            // Start/Stop Live GPS Tracking accordingly
            if (nextStatus === 'on_the_way') {
                startLiveGPSTracking(bookingId);
            } else if (['arrived', 'working', 'started', 'completed'].includes(nextStatus)) {
                stopLiveGPSTracking();
            }

            // If job completed, remove from list or refresh
            if (nextStatus === 'completed') {
                alert("Job completed! Earnings & analytics updated.");
                fetchJobs();
            }
        } catch (err) {
            console.error("Failed to update status transition:", err);
            alert("Error updating booking status.");
        }
    };

    // Live Geolocation API tracking emitter (updates every 30-60s)
    const startLiveGPSTracking = (bookingId) => {
        if (!navigator.geolocation) {
            console.warn("Geolocation API not supported by browser.");
            return;
        }

        setTrackingBookingId(bookingId);
        console.log("Starting live location updates for booking ID:", bookingId);

        const id = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                console.log(`GPS watch coordinates update: Lat ${latitude}, Lng ${longitude}`);
                
                // Emit to Socket.IO room for customer track details
                if (socket) {
                    socket.emit("worker_location_update", {
                        bookingId,
                        lat: latitude,
                        lng: longitude
                    });
                }
            },
            (err) => {
                console.error("GPS Watch error:", err);
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 10000
            }
        );
        setWatchId(id);
    };

    const stopLiveGPSTracking = () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setTrackingBookingId(null);
        console.log("Stopped live location updates.");
    };

    const handleOpenChat = (recipient, booking) => {
        setChatRecipient(recipient);
        setChatBooking(booking);
        setIsChatOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="space-y-1">
                    <h1 className="text-3xl font-heading font-black tracking-tight">Today's Scheduled Jobs</h1>
                    <p className="text-slate-400 text-sm">Manage accepted jobs, start traveling, mark arrival, and complete works.</p>
                </div>

                {/* Tracking status bar warning */}
                {trackingBookingId && (
                    <div className="bg-green-950/20 border border-green-800 text-green-400 p-4 rounded-2xl flex items-center space-x-3 text-xs animate-pulse">
                        <Navigation className="w-4.5 h-4.5 shrink-0 text-green-500 animate-spin" />
                        <span className="font-bold">Live GPS tracking active for Booking Reference: {trackingBookingId}</span>
                    </div>
                )}

                {/* Jobs schedule list */}
                <div className="space-y-5">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 font-semibold">Loading schedules...</div>
                    ) : bookings.length > 0 ? (
                        bookings.map((job) => {
                            const isTraveling = job.status === 'on_the_way';
                            const hasArrived = job.status === 'arrived';
                            const isWorking = ['working', 'started'].includes(job.status);

                            return (
                                <div 
                                    key={job._id}
                                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-6"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-750 pb-5">
                                        <div>
                                            <h4 className="font-heading font-black text-white text-lg">{job.user?.username || 'Client'}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Contact: {job.user?.phone || 'Not Shared'}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            {job.user && (
                                                <button
                                                    onClick={() => handleOpenChat(job.user, job)}
                                                    className="p-2.5 bg-slate-700 hover:bg-slate-650 rounded-xl text-slate-300 border border-slate-600 transition-colors"
                                                    title="Chat with client"
                                                >
                                                    <MessageSquare className="w-4.5 h-4.5" />
                                                </button>
                                            )}
                                            <a
                                                href={`tel:${job.user?.phone || '9876543210'}`}
                                                className="p-2.5 bg-slate-700 hover:bg-slate-650 rounded-xl text-slate-300 border border-slate-600 transition-colors flex items-center justify-center"
                                                title="Call client"
                                            >
                                                <Phone className="w-4.5 h-4.5" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Location particulars */}
                                    <div className="space-y-2.5 text-xs font-semibold text-slate-350">
                                        <div className="flex items-center text-slate-400">
                                            <MapPin className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
                                            <span className="truncate">{job.location?.address}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-slate-500" /> {job.hours} Hours Job</span>
                                            <span className="flex items-center text-white"><DollarSign className="w-4 h-4 mr-1 text-slate-500" /> ₹{job.totalPrice}</span>
                                        </div>
                                    </div>

                                    {/* Stepper Control transition triggers */}
                                    <div className="flex flex-wrap gap-2.5 pt-2">
                                        {job.status === 'accepted' && (
                                            <button
                                                onClick={() => handleStatusTransition(job._id, 'on_the_way')}
                                                className="flex-1 py-3.5 bg-gradient-to-r from-primary to-orange-500 hover:from-primaryDark hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                                            >
                                                <Play className="w-4 h-4 fill-current shrink-0" />
                                                <span>Start Journey 🚗</span>
                                            </button>
                                        )}
                                        {isTraveling && (
                                            <button
                                                onClick={() => handleStatusTransition(job._id, 'arrived')}
                                                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer animate-pulse"
                                            >
                                                <Navigation className="w-4 h-4 fill-current shrink-0 animate-spin" />
                                                <span>Mark as Reached 📍</span>
                                            </button>
                                        )}
                                        {hasArrived && (
                                            <button
                                                onClick={() => handleStatusTransition(job._id, 'working')}
                                                className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                                            >
                                                <Play className="w-4 h-4 fill-current shrink-0" />
                                                <span>Start Work 🔨</span>
                                            </button>
                                        )}
                                        {isWorking && (
                                            <button
                                                onClick={() => handleStatusTransition(job._id, 'completed')}
                                                className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                                            >
                                                <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                                                <span>Complete Job ✓</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                            No scheduled jobs scheduled for today
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ChatModal 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                recipient={chatRecipient} 
                booking={chatBooking}
            />
        </div>
    );
};

export default TodayJobs;
