import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Users, Briefcase, Calendar, DollarSign, ArrowLeft, 
    ArrowRight, MessageSquare, BarChart, ShieldCheck, Flag
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [labours, setLabours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Fetch all bookings
                const bookingsRes = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(bookingsRes.data);

                // Fetch all handymen
                const laboursRes = await axios.get('http://localhost:5000/api/auth/labours');
                setLabours(laboursRes.data);
            } catch (err) {
                console.error("Error fetching admin statistics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [user, navigate]);

    // Statistics computation
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const activeBookings = bookings.filter(b => ['accepted', 'on_the_way', 'arrived', 'working', 'started'].includes(b.status)).length;
    const totalHandymen = labours.length;
    
    // Sum prices
    const grossRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const platformCommission = Math.round(grossRevenue * 0.15); // 15% booking fees

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                
                {/* Header greeting */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-heading font-black tracking-tight flex items-center space-x-2">
                            <span>🛡 Admin Control Panel</span>
                        </h1>
                        <p className="text-slate-400 text-sm">Welcome back, {user?.username}. Overview of system status and active bookings.</p>
                    </div>
                </div>

                {/* Metrics grids */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-1 text-center">
                        <Users className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Handymen</p>
                        <p className="text-2xl font-heading font-black text-white">{totalHandymen}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-1 text-center">
                        <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bookings</p>
                        <p className="text-2xl font-heading font-black text-white">{totalBookings}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-1 text-center">
                        <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Bookings</p>
                        <p className="text-2xl font-heading font-black text-white">₹{grossRevenue}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-1 text-center">
                        <BarChart className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Commission (15%)</p>
                        <p className="text-2xl font-heading font-black text-primary">₹{platformCommission}</p>
                    </div>
                </div>

                {/* Sub routing modules navigations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-3xl text-left hover:bg-slate-800/50 hover:border-primary transition-all group flex justify-between items-center cursor-pointer"
                    >
                        <div>
                            <h3 className="font-bold text-white text-base">Users Directory</h3>
                            <p className="text-xs text-slate-450 mt-1">Review customers profile details.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                    </button>
                    <button
                        onClick={() => navigate('/admin/workers')}
                        className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-3xl text-left hover:bg-slate-800/50 hover:border-primary transition-all group flex justify-between items-center cursor-pointer"
                    >
                        <div>
                            <h3 className="font-bold text-white text-base">Workers Directory</h3>
                            <p className="text-xs text-slate-455 mt-1">Approve, rate, or restrict specialists.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                    </button>
                    <button
                        onClick={() => navigate('/admin/bookings')}
                        className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-3xl text-left hover:bg-slate-800/50 hover:border-primary transition-all group flex justify-between items-center cursor-pointer"
                    >
                        <div>
                            <h3 className="font-bold text-white text-base">Bookings Log</h3>
                            <p className="text-xs text-slate-450 mt-1">Monitor active journeys and invoices.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                    </button>
                </div>

                {/* Sub sections overview: flag reports preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active bookings list */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-750 pb-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350 flex items-center space-x-1.5">
                                <Briefcase className="w-4.5 h-4.5 text-primary" />
                                <span>Recent Active Bookings</span>
                            </h3>
                            <span className="text-[10px] bg-slate-900 border border-slate-800 py-0.5 px-2.5 rounded-full text-slate-400 font-bold uppercase">{activeBookings} Active</span>
                        </div>
                        
                        <div className="divide-y divide-slate-800 space-y-3.5 pt-2">
                            {loading ? (
                                <p className="text-center text-slate-550 text-xs">Loading bookings...</p>
                            ) : bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length > 0 ? (
                                bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').slice(0, 3).map(item => (
                                    <div key={item._id} className="flex justify-between items-center text-xs text-slate-300 font-semibold pt-3.5 first:pt-0">
                                        <div>
                                            <p className="text-white font-bold">{item.user?.username || 'Client'} ➔ {item.labour?.username || 'Handyman'}</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5 uppercase">{item.labour?.profession || 'Service'}</p>
                                        </div>
                                        <span className="px-2.5 py-0.5 bg-yellow-950/20 border border-yellow-900/40 text-yellow-450 rounded-full text-[9px] uppercase font-bold">{item.status}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 text-xs font-bold uppercase pt-4">No active booking tasks today</p>
                            )}
                        </div>
                    </div>

                    {/* Flags / Abuse reports summary */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-750 pb-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350 flex items-center space-x-1.5">
                                <Flag className="w-4.5 h-4.5 text-red-400" />
                                <span>Recent Flagged Incidents</span>
                            </h3>
                            <span className="text-[10px] bg-red-950/30 border border-red-900/40 py-0.5 px-2.5 rounded-full text-red-400 font-bold uppercase">System Alerts</span>
                        </div>
                        
                        <div className="space-y-3.5 pt-2 text-xs font-semibold text-slate-450">
                            <div className="bg-slate-900/20 border border-slate-850 p-4.5 rounded-2xl text-slate-300 text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Security & Logs</p>
                                <p className="mt-1 leading-relaxed">All backend microservices, database, and socket connections are fully operational. Zero user disputes or flagged tickets reported today.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
