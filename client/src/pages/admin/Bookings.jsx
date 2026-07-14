import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Briefcase, Trash2, ArrowLeft, Search, Calendar, Clock, 
    DollarSign, X, Check, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error("Error fetching all bookings log:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchAllBookings();
    }, [user, navigate]);

    const handleCancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to force cancel this booking?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${id}`, {
                status: 'cancelled'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllBookings();
            alert("Booking cancelled successfully.");
        } catch (err) {
            console.error("Error force cancelling booking:", err);
            alert("Failed to cancel booking.");
        }
    };

    const handleForceComplete = async (id) => {
        if (!window.confirm("Are you sure you want to force complete this booking?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${id}`, {
                status: 'completed'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllBookings();
            alert("Booking marked completed.");
        } catch (err) {
            console.error("Error force completing booking:", err);
            alert("Failed to mark completed.");
        }
    };

    const filteredBookings = bookings.filter(b => 
        (b.user?.username && b.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.labour?.username && b.labour.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.labour?.profession && b.labour.profession.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="space-y-1">
                    <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2.5">
                        <Briefcase className="w-8 h-8 text-primary" />
                        <span>System Bookings Logs</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Monitor all bookings happening across customers and handymen on the platform.</p>
                </div>

                {/* Search Bar */}
                <div className="bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-2xl flex items-center max-w-md">
                    <Search className="w-5 h-5 text-slate-450 ml-2.5 shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Search by client, worker, or service type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-white focus:outline-none text-xs w-full pl-3 pr-2 py-1.5 font-semibold placeholder-slate-500"
                    />
                </div>

                {/* Log List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-455 font-semibold">Searching platform booking logs...</div>
                    ) : filteredBookings.length > 0 ? (
                        <AnimatePresence>
                            {filteredBookings.map((item) => {
                                const isLive = ['pending', 'accepted', 'on_the_way', 'arrived', 'working', 'started'].includes(item.status);
                                return (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                    >
                                        <div className="space-y-1.5 min-w-0 flex-grow">
                                            <h4 className="font-bold text-white text-base leading-tight truncate">
                                                {item.user?.username || 'Client'} ➔ {item.labour?.username || 'Worker Specialist'}
                                            </h4>
                                            <p className="text-primary font-bold text-[10px] uppercase tracking-wider">{item.labour?.profession || 'Daily labour'}</p>
                                            
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold">
                                                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {new Date(item.date).toLocaleDateString()}</span>
                                                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {item.hours} Hours</span>
                                                <span className="flex items-center text-white"><DollarSign className="w-3.5 h-3.5 mr-1 text-slate-500" /> ₹{item.totalPrice}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase mr-1.5 ${
                                                isLive 
                                                    ? 'bg-yellow-950/20 border-yellow-900/40 text-yellow-450' 
                                                    : item.status === 'completed'
                                                        ? 'bg-green-950/20 border-green-900/40 text-green-400'
                                                        : 'bg-red-950/20 border-red-900/40 text-red-400'
                                            }`}>
                                                {item.status.replace(/_/g, ' ')}
                                            </span>

                                            {isLive && (
                                                <>
                                                    <button
                                                        onClick={() => handleForceComplete(item._id)}
                                                        className="p-2.5 bg-green-950/20 hover:bg-green-950/40 border border-green-900/40 hover:border-green-900 rounded-xl text-green-400 transition-all cursor-pointer"
                                                        title="Force Mark Completed"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelBooking(item._id)}
                                                        className="p-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-900 rounded-xl text-red-400 transition-all cursor-pointer"
                                                        title="Force Cancel Booking"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-16 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                            No booking logs found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
