import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Search, MapPin, Sparkles, ChevronRight, Briefcase, Calendar, Clock, Star, 
    Zap, Calculator, ShieldCheck, Compass, Info, Hammer, Phone, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import BookingModal from '../../components/BookingModal';
import ChatModal from '../../components/ChatModal';
import MapComponent from '../../components/MapComponent';
import AIAssistant from '../../components/AIAssistant';

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

const CustomerHome = () => {
    const { user, socket } = useAuth();
    const navigate = useNavigate();

    // Data States
    const [bookings, setBookings] = useState([]);
    const [labours, setLabours] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingLabour, setBookingLabour] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState(null);
    const [chatBooking, setChatBooking] = useState(null);

    // Search Category
    const [searchVal, setSearchVal] = useState('');
    const [customerLoc, setCustomerLoc] = useState({ lat: 28.6139, lng: 77.2090 }); // default Delhi coordinates

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Try getting customer GPS location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCustomerLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => {
                    console.warn("Navigator location blocked in customer dashboard, using default coordinates");
                }
            );
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                
                // Fetch user bookings
                const bookingsRes = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(bookingsRes.data);

                // Fetch nearby labours
                const laboursRes = await axios.get(`http://localhost:5000/api/auth/labours?lat=${customerLoc.lat}&lng=${customerLoc.lng}&radius=10`);
                setLabours(laboursRes.data);
            } catch (err) {
                console.error("Dashboard data fetching failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        if (socket) {
            socket.on('booking_status_update', (updated) => {
                setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
            });
            return () => socket.off('booking_status_update');
        }
    }, [user, navigate, socket]);

    const handleOpenBook = (labour) => {
        setBookingLabour(labour);
        setIsBookingOpen(true);
    };

    const handleOpenChat = (recipient, booking) => {
        setChatRecipient(recipient);
        setChatBooking(booking);
        setIsChatOpen(true);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchVal.trim()) {
            navigate(`/find-labour?search=${encodeURIComponent(searchVal)}`);
        }
    };

    // Filter active bookings to display
    const activeBooking = bookings.find(b => ['pending', 'accepted', 'started', 'working', 'on_the_way', 'arrived'].includes(b.status));

    // Services categories list
    const quickServices = [
        { name: 'Electrician', emoji: '🔧' },
        { name: 'Plumber', emoji: '🚰' },
        { name: 'Cleaner', emoji: '🧹' },
        { name: 'Carpenter', emoji: '🛠' },
        { name: 'Painter', emoji: '🎨' },
        { name: 'Mason', emoji: '🧱' }
    ];

    return (
        <div className="min-h-screen bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. Welcoming Header */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden">
                    <div className="space-y-2.5 z-10">
                        <span className="bg-primary/10 border border-primary/25 text-primary text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider">
                            Daily Labour Marketplace
                        </span>
                        <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight">
                            👋 Good Afternoon, {user?.username || 'Abhi'}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Need help today? Search for verified nearby service providers.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
                        <div className="flex items-center space-x-2 bg-slate-900/60 px-4.5 py-3 rounded-2xl border border-slate-850">
                            <MapPin className="w-5 h-5 text-primary shrink-0 animate-bounce" />
                            <div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">Current Location</p>
                                <p className="text-white text-xs font-black mt-1 leading-none">New Delhi Center, IND</p>
                            </div>
                        </div>
                    </div>
                    {/* decorative ambient glow */}
                    <div className="absolute right-0 top-0 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                {/* 2. Quick Search & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Search Panel */}
                    <div className="lg:col-span-2 bg-slate-800/25 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center space-y-4">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-450 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search worker or service..."
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-2xl pl-12 pr-4.5 py-3.5 text-sm text-white focus:outline-none focus:border-primary font-semibold shadow-inner placeholder-slate-500"
                            />
                        </form>
                        
                        <div className="flex flex-wrap gap-2 pt-1">
                            <button 
                                onClick={() => navigate('/find-labour')}
                                className="flex items-center space-x-1 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[10px] font-black uppercase rounded-xl transition-all"
                            >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>Need Worker Now</span>
                            </button>
                            <button 
                                onClick={() => navigate('/find-labour')}
                                className="flex items-center space-x-1 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 text-[10px] font-black uppercase rounded-xl transition-all"
                            >
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                <span>Best Worker Near Me</span>
                            </button>
                            <button 
                                onClick={() => navigate('/find-labour?estimator=true')}
                                className="flex items-center space-x-1 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-200 text-[10px] font-black uppercase rounded-xl transition-all"
                            >
                                <Calculator className="w-3.5 h-3.5 text-secondary" />
                                <span>Price Estimator</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Chat Greeting Shortcut */}
                    <div className="bg-gradient-to-br from-primary/10 to-orange-500/5 border border-primary/20 rounded-3xl p-6 flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-xl">🤖</span>
                                <h3 className="font-heading font-black text-sm uppercase tracking-wider text-white">Ask AI Assistant</h3>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed">Let DailyLabour AI match, compare, and quote price estimations instantly for you.</p>
                        </div>
                        <button 
                            onClick={() => alert("Click the floating AI Assistant on the bottom right to start chatting!")}
                            className="mt-4 w-full bg-primary hover:bg-primaryDark text-white font-heading font-black text-xs py-3 rounded-2xl uppercase tracking-wider transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                        >
                            Start AI Dialog
                        </button>
                    </div>
                </div>

                {/* 3. Quick Services Icons Grid */}
                <div className="space-y-4">
                    <h2 className="text-xl font-heading font-black tracking-tight">Quick Services</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {quickServices.map(srv => (
                            <Link
                                key={srv.name}
                                to={`/find-labour?category=${srv.name}`}
                                className="bg-slate-800/40 backdrop-blur border border-slate-700/40 hover:border-primary/50 p-5 rounded-3xl flex flex-col items-center justify-center text-center group transition-all duration-300 shadow-sm"
                            >
                                <span className="text-3xl bg-slate-900/60 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-slate-800">
                                    {srv.emoji}
                                </span>
                                <span className="text-xs font-black uppercase tracking-wider mt-3.5 text-slate-350 group-hover:text-primary">
                                    {srv.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 4. Active Booking HUD or Nearby Map */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Map of Workers */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-heading font-black tracking-tight">Nearby Workers Map</h2>
                            <span className="text-xs font-bold text-slate-400">Radius: 10 KM</span>
                        </div>
                        
                        <div className="h-[340px] rounded-3xl overflow-hidden border border-slate-750/80 shadow-2xl relative">
                            {loading ? (
                                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
                                    Initializing tracking map layers...
                                </div>
                            ) : (
                                <MapComponent
                                    labours={labours}
                                    customerLoc={customerLoc}
                                    searchRadius={10}
                                    onBook={handleOpenBook}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right side: Recent Bookings & Trending list */}
                    <div className="space-y-6">
                        
                        {/* Recent Active Booking Card */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-heading font-black tracking-tight">Recent Booking</h2>
                            {activeBooking ? (
                                <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 p-5 rounded-3xl shadow-xl space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[9px] bg-primary/10 border border-primary/25 text-primary font-black py-0.5 px-2 rounded-full uppercase leading-none">
                                                Active Job
                                            </span>
                                            <h4 className="font-bold text-sm text-white mt-2">
                                                {activeBooking.bookingId || `#BK${activeBooking._id.slice(-4).toUpperCase()}`}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{activeBooking.labour?.profession}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-500/15 text-green-400 border border-green-500/20">
                                            {activeBooking.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-350 bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> {new Date(activeBooking.date).toLocaleDateString()}</span>
                                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> {activeBooking.scheduledTime || '09:00 AM'}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => navigate(`/customer/track/${activeBooking._id}`)}
                                            className="py-2.5 bg-primary hover:bg-primaryDark text-white font-bold rounded-xl text-[10px] uppercase tracking-wider text-center cursor-pointer shadow"
                                        >
                                            Track Worker 📍
                                        </button>
                                        <button
                                            onClick={() => handleOpenChat(activeBooking.labour, activeBooking)}
                                            className="py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider text-center cursor-pointer border border-slate-800"
                                        >
                                            Chat Room
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-800/10 border border-slate-800 border-dashed p-6 rounded-3xl text-center text-xs text-slate-450 uppercase font-bold tracking-wider">
                                    No active bookings.
                                </div>
                            )}
                        </div>

                        {/* Trending Workers */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-heading font-black tracking-tight">Trending Workers</h2>
                            <div className="space-y-3">
                                {labours.slice(0, 2).map(labour => (
                                    <div key={labour._id} className="bg-slate-800/30 border border-slate-750/80 p-4 rounded-3xl flex items-center justify-between shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <img src={getAvatarUrl(labour.username)} alt="" className="w-11 h-11 rounded-xl object-cover bg-slate-800" />
                                            <div>
                                                <h4 className="font-extrabold text-white text-xs leading-none">{labour.username}</h4>
                                                <p className="text-[9px] text-primary uppercase font-bold tracking-wider mt-1.5">{labour.profession}</p>
                                                <div className="flex items-center text-amber-500 text-[10px] font-black mt-1">
                                                    <Star className="w-3 h-3 fill-current mr-0.5" />
                                                    <span className="text-slate-300">{labour.rating || 4.8} ({labour.totalReviews || 24} reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleOpenBook(labour)}
                                            className="bg-slate-900 hover:bg-slate-850 text-white text-[9px] font-black py-2.5 px-4 rounded-xl border border-slate-800 uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            Book
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Modals */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                labour={bookingLabour}
            />

            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipient={chatRecipient}
                booking={chatBooking}
            />

            {/* Floating AI Labour Assistant */}
            <AIAssistant 
                labours={labours}
                onBook={handleOpenBook}
                onFilterCategory={(cat) => navigate(`/find-labour?category=${cat}`)}
                onHighlightWorker={(w) => navigate(`/customer/worker-profile/${w._id}`)}
            />
        </div>
    );
};

export default CustomerHome;
