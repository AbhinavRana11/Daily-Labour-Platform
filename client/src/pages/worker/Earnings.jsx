import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    DollarSign, ArrowLeft, Calendar, ArrowUpRight, TrendingUp, 
    FileText, User, Award, ArrowDownLeft
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

const Earnings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchEarningsBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Filter only completed bookings
                setBookings(res.data.filter(b => b.status === 'completed'));
            } catch (err) {
                console.error("Error fetching earnings data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEarningsBookings();
    }, [user, navigate]);

    // Calculate mock earnings totals
    const totalEarnings = bookings.reduce((sum, b) => sum + b.totalPrice, 0) || 12450;
    const todayEarnings = bookings.length > 0 ? bookings[0].totalPrice : 350;
    const weeklyEarnings = Math.round(totalEarnings * 0.45);
    const monthlyEarnings = Math.round(totalEarnings * 0.85);

    // Mock chart data for SVG rendering
    const dailyIncome = [
        { label: 'Mon', value: 800 },
        { label: 'Tue', value: 1200 },
        { label: 'Wed', value: 950 },
        { label: 'Thu', value: 1500 },
        { label: 'Fri', value: 1800 },
        { label: 'Sat', value: 2400 },
        { label: 'Sun', value: 1200 }
    ];

    // Compute Line Chart SVG parameters
    const chartHeight = 120;
    const chartWidth = 500;
    const maxVal = Math.max(...dailyIncome.map(d => d.value));
    const points = dailyIncome.map((d, i) => {
        const x = (i / (dailyIncome.length - 1)) * (chartWidth - 40) + 20;
        const y = chartHeight - (d.value / maxVal) * (chartHeight - 30) - 10;
        return `${x},${y}`;
    }).join(' ');

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
                    <h1 className="text-3xl font-heading font-black tracking-tight">Earnings Dashboard</h1>
                    <p className="text-slate-400 text-sm">Monitor your income performance, cash withdrawals, and invoice payouts.</p>
                </div>

                {/* Earnings card grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Revenue</p>
                        <h3 className="text-2xl font-heading font-black text-white">₹{todayEarnings}</h3>
                        <p className="text-[9px] text-green-400 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12% vs yesterday</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">This Week</p>
                        <h3 className="text-2xl font-heading font-black text-white">₹{weeklyEarnings}</h3>
                        <p className="text-[9px] text-green-400 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +8% vs last week</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">This Month</p>
                        <h3 className="text-2xl font-heading font-black text-white">₹{monthlyEarnings}</h3>
                        <p className="text-[9px] text-green-400 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +15% vs last month</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-750 p-5 rounded-3xl space-y-2 bg-gradient-to-br from-slate-800/40 to-slate-900/60">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Income</p>
                        <h3 className="text-2xl font-heading font-black text-primary">₹{totalEarnings}</h3>
                        <p className="text-[9px] text-slate-400 font-semibold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-0.5 text-primary" /> Overall earnings</p>
                    </div>
                </div>

                {/* SVG income trend line chart */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Income Trend (This Week)</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Interactive Graph</span>
                    </div>

                    {/* Chart wrapper */}
                    <div className="w-full overflow-x-auto py-4">
                        <div className="min-w-[500px]">
                            <svg className="w-full h-[150px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                                {/* Grid lines */}
                                <line x1="20" y1="20" x2="480" y2="20" stroke="#334155" strokeWidth="0.8" strokeDasharray="5, 5" />
                                <line x1="20" y1="60" x2="480" y2="60" stroke="#334155" strokeWidth="0.8" strokeDasharray="5, 5" />
                                <line x1="20" y1="100" x2="480" y2="100" stroke="#334155" strokeWidth="0.8" strokeDasharray="5, 5" />

                                {/* Trend line */}
                                <polyline
                                    fill="none"
                                    stroke="#F59E0B"
                                    strokeWidth="3.5"
                                    points={points}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Points circles */}
                                {dailyIncome.map((d, i) => {
                                    const x = (i / (dailyIncome.length - 1)) * (chartWidth - 40) + 20;
                                    const y = chartHeight - (d.value / maxVal) * (chartHeight - 30) - 10;
                                    return (
                                        <g key={i} className="group cursor-pointer">
                                            <circle cx={x} cy={y} r="5.5" fill="#F59E0B" stroke="#1E293B" strokeWidth="2" />
                                            {/* tooltip overlay */}
                                            <text x={x} y={y - 12} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1 py-0.5 rounded">₹{d.value}</text>
                                        </g>
                                    );
                                })}

                                {/* Labels */}
                                {dailyIncome.map((d, i) => {
                                    const x = (i / (dailyIncome.length - 1)) * (chartWidth - 40) + 20;
                                    return (
                                        <text key={i} x={x} y={chartHeight} textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="bold">{d.label}</text>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Earnings statement transactions history list */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Completed Payout History</h3>
                    
                    <div className="divide-y divide-slate-800">
                        {loading ? (
                            <div className="text-center py-6 text-slate-400">Loading payout statements...</div>
                        ) : bookings.length > 0 ? (
                            bookings.map(item => (
                                <div key={item._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3.5">
                                        <img src={getAvatarUrl(item.user?.username || 'Client')} alt="Client" className="w-11 h-11 rounded-xl object-cover bg-slate-700 border border-slate-650" />
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{item.user?.username || 'Customer'}</h4>
                                            <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Booking ID: {item._id}</p>
                                        </div>
                                    </div>

                                    <div className="text-right space-y-1">
                                        <p className="text-green-400 font-extrabold text-sm flex items-center justify-end"><ArrowUpRight className="w-4 h-4 mr-0.5" /> +₹{item.totalPrice}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-wider">No completed payout transactions found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Earnings;
