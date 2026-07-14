import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    AlertCircle, Briefcase, MapPin, CheckCircle, Clock, 
    DollarSign, Star, Eye, Calendar, Settings, Edit3, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const getAvatarUrl = (username) => {
    const avatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200", // Female
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200", // Male
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200", // Male
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200", // Female
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200", // Male
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200"  // Female
    ];
    const index = Math.abs(username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % avatars.length;
    return avatars[index];
};

const WorkerDashboard = () => {
    const { user, socket, updateUser } = useAuth();
    const navigate = useNavigate();

    // Data states
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit states
    const [rate, setRate] = useState('');
    const [isSavingRate, setIsSavingRate] = useState(false);
    
    const [serviceRadius, setServiceRadius] = useState(10);
    const [isSavingRadius, setIsSavingRadius] = useState(false);

    const [isAvailable, setIsAvailable] = useState(true);
    const [isSavingAvailability, setIsSavingAvailability] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        setIsAvailable(user.isAvailable !== false);
        setRate(user.rate || '350');
        setServiceRadius(user.serviceRadius || 10);

        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
            } catch (err) {
                console.error("Error loading worker dashboard bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();

        if (socket) {
            socket.on('booking_status_update', (updated) => {
                setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
            });
            return () => socket.off('booking_status_update');
        }
    }, [user, socket, navigate]);

    const handleToggleAvailability = async () => {
        setIsSavingAvailability(true);
        try {
            const token = localStorage.getItem('token');
            const newAvailability = !isAvailable;
            const res = await axios.put('http://localhost:5000/api/auth/worker/availability', {
                isAvailable: newAvailability
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAvailable(newAvailability);
            updateUser({ isAvailable: newAvailability });
        } catch (err) {
            console.error("Error setting availability:", err);
            alert("Failed to toggle availability state.");
        } finally {
            setIsSavingAvailability(false);
        }
    };

    const handleSaveRate = async () => {
        setIsSavingRate(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/auth/worker/price', {
                rate: Number(rate)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateUser({ rate: Number(rate) });
            alert("Hourly rate updated successfully.");
        } catch (err) {
            console.error("Error saving rate:", err);
            alert("Failed to save hourly rate.");
        } finally {
            setIsSavingRate(false);
        }
    };

    const handleSaveRadius = async (radius) => {
        setIsSavingRadius(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/auth/worker/radius', {
                serviceRadius: Number(radius)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServiceRadius(radius);
            updateUser({ serviceRadius: radius });
        } catch (err) {
            console.error("Error saving radius:", err);
            alert("Failed to update service radius.");
        } finally {
            setIsSavingRadius(false);
        }
    };

    const pendingRequests = bookings.filter(b => b.status === 'pending');
    const todayJobs = bookings.filter(b => 
        ['accepted', 'on_the_way', 'arrived', 'working', 'started'].includes(b.status)
    );

    // Mock stats
    const totalEarnings = 12450;
    const avgRating = user?.rating || 4.9;
    const profileViews = 184;

    const avatar = getAvatarUrl(user?.username || 'Worker');

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                
                {/* Greeting Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-4">
                        <img src={avatar} alt={user?.username} className="w-16 h-16 rounded-2xl object-cover bg-slate-700 border border-slate-650 shadow" />
                        <div>
                            <h1 className="text-2xl font-heading font-black tracking-tight">👋 Hello, {user?.username || 'Worker'}</h1>
                            <p className="text-primary font-bold text-xs uppercase tracking-wider mt-0.5">{user?.profession || 'Contractor Specialist'}</p>
                        </div>
                    </div>
                    
                    {/* Want work today toggle */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-6 ${isAvailable ? 'bg-green-950/20 border-green-800 text-green-400' : 'bg-red-950/20 border-red-900 text-red-400'}`}>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Work Status Today</p>
                            <p className="text-xs font-black mt-0.5">{isAvailable ? 'Accepting Job Requests' : 'Stopped Taking Jobs'}</p>
                        </div>
                        <button
                            onClick={handleToggleAvailability}
                            disabled={isSavingAvailability}
                            className={`w-12 h-6.5 rounded-full p-1 transition-colors relative focus:outline-none cursor-pointer ${isAvailable ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${isAvailable ? 'translate-x-5.5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Dashboard statistics cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-3xl space-y-1">
                        <div className="bg-slate-800 p-2 rounded-xl text-primary w-fit"><AlertCircle className="w-5 h-5" /></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Requests</p>
                        <p className="text-2xl font-heading font-black text-white">{pendingRequests.length}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-3xl space-y-1">
                        <div className="bg-slate-800 p-2 rounded-xl text-secondary w-fit"><Briefcase className="w-5 h-5" /></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Active Jobs</p>
                        <p className="text-2xl font-heading font-black text-white">{todayJobs.length}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-3xl space-y-1 col-span-2 sm:col-span-1">
                        <div className="bg-slate-800 p-2 rounded-xl text-green-400 w-fit"><DollarSign className="w-5 h-5" /></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Earnings</p>
                        <p className="text-2xl font-heading font-black text-white">₹{totalEarnings}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-3xl space-y-1">
                        <div className="bg-slate-800 p-2 rounded-xl text-amber-500 w-fit"><Star className="w-5 h-5 fill-current" /></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Rating</p>
                        <p className="text-2xl font-heading font-black text-white">{avgRating}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-3xl space-y-1">
                        <div className="bg-slate-800 p-2 rounded-xl text-slate-350 w-fit"><Eye className="w-5 h-5" /></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">Profile Views</p>
                        <p className="text-2xl font-heading font-black text-white">{profileViews}</p>
                    </div>
                </div>

                {/* Split main section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Availability Settings, Rates, Radius */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Rate settings card */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 shadow-xl space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Configure Service Price</h3>
                            <div className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-450 uppercase">Hourly Rate (₹/hr)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={rate}
                                                onChange={(e) => setRate(e.target.value)}
                                                className="w-full bg-slate-900/40 border border-slate-700 rounded-xl pl-7 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary font-bold"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveRate}
                                            disabled={isSavingRate}
                                            className="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-xl font-bold text-xs flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                        >
                                            {isSavingRate ? '...' : <Check className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-900/30 p-3.5 rounded-2xl border border-slate-850">
                                    <p className="text-[10px] text-slate-450 font-bold uppercase">Mock Emergency Rate</p>
                                    <p className="text-lg font-heading font-black mt-1">₹500/hr <span className="text-[9px] text-slate-500 font-normal">(Auto enabled for emergencies)</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Service radius selection */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 shadow-xl space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Service Radius Limit</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {[5, 10, 15, 20].map(dist => (
                                        <button
                                            key={dist}
                                            onClick={() => handleSaveRadius(dist)}
                                            className={`py-2 px-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                                                serviceRadius === dist 
                                                    ? 'bg-primary border-primary text-white shadow-md' 
                                                    : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/40'
                                            }`}
                                        >
                                            {dist} KM
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] text-slate-450 leading-normal font-semibold">Define search limit. You will receive job notifications from customers matching within this radius.</p>
                            </div>
                        </div>

                        {/* Working schedule hours */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 shadow-xl space-y-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Working Hours</h3>
                            <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-2xl text-xs font-semibold text-slate-300 space-y-2 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>Regular Hours: 9 AM - 6 PM</span>
                                </div>
                                <p className="text-[9px] text-slate-500">Working hours are configured to automatically toggle service availability.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Job requests summaries, navigation list links */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Navigation quick links for Worker pages */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <button onClick={() => navigate('/worker/requests')} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-2xl text-center hover:bg-slate-800/50 hover:border-primary transition-all group cursor-pointer">
                                <p className="text-2xl mb-1 group-hover:scale-105 transition-transform">📋</p>
                                <p className="text-xs font-bold text-slate-350 group-hover:text-white">Job Requests</p>
                            </button>
                            <button onClick={() => navigate('/worker/today-jobs')} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-2xl text-center hover:bg-slate-800/50 hover:border-primary transition-all group group cursor-pointer">
                                <p className="text-2xl mb-1 group-hover:scale-105 transition-transform">🚗</p>
                                <p className="text-xs font-bold text-slate-350 group-hover:text-white">Active Journey</p>
                            </button>
                            <button onClick={() => navigate('/worker/earnings')} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-2xl text-center hover:bg-slate-800/50 hover:border-primary transition-all group cursor-pointer">
                                <p className="text-2xl mb-1 group-hover:scale-105 transition-transform">📊</p>
                                <p className="text-xs font-bold text-slate-350 group-hover:text-white">Earnings Log</p>
                            </button>
                            <button onClick={() => navigate('/worker/portfolio')} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-2xl text-center hover:bg-slate-800/50 hover:border-primary transition-all group cursor-pointer">
                                <p className="text-2xl mb-1 group-hover:scale-105 transition-transform">📷</p>
                                <p className="text-xs font-bold text-slate-350 group-hover:text-white">Portfolio Gallery</p>
                            </button>
                        </div>

                        {/* Recent Job requests list preview */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-heading font-black text-white tracking-tight">Active Pending Requests</h2>
                                <button onClick={() => navigate('/worker/requests')} className="text-xs font-bold text-primary hover:underline">View All Requests</button>
                            </div>
                            
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-6 text-slate-400">Loading requests...</div>
                                ) : pendingRequests.length > 0 ? (
                                    pendingRequests.slice(0, 2).map(req => (
                                        <div key={req._id} className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <h4 className="font-heading font-black text-white text-base truncate">{req.user?.username || 'Client'}</h4>
                                                <p className="text-slate-400 text-xs flex items-center mt-1">
                                                    <MapPin className="w-3.5 h-3.5 mr-1" /> {req.location?.address}
                                                </p>
                                                <div className="flex space-x-4 mt-2 text-xs font-semibold text-slate-300">
                                                    <span className="bg-slate-900/40 border border-slate-750 px-2.5 py-1 rounded-lg">{req.hours} Hours</span>
                                                    <span className="bg-green-950/20 border border-green-900/40 text-green-400 px-2.5 py-1 rounded-lg">₹{req.totalPrice}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => navigate('/worker/requests')}
                                                className="bg-primary hover:bg-primaryDark text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                                            >
                                                View Request
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-slate-800/10 border border-slate-850 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        No active pending requests today
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
