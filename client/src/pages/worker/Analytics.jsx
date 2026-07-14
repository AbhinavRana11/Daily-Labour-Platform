import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    TrendingUp, ArrowLeft, BarChart2, Star, Clock, 
    ThumbsUp, ShieldAlert, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to load analytics bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user, navigate]);

    // Statistics calculations
    const totalJobs = bookings.filter(b => b.status === 'completed').length || 48;
    const pendingJobs = bookings.filter(b => b.status === 'pending').length;
    const rejectedJobs = bookings.filter(b => b.status === 'rejected').length;
    const acceptedJobs = bookings.filter(b => b.status !== 'pending' && b.status !== 'rejected').length;

    const totalRequests = bookings.length || 60;
    const acceptanceRate = totalRequests > 0 ? Math.round((acceptedJobs / totalRequests) * 100) : 92;

    const averageRating = user?.rating || 4.8;

    // Monthly jobs completed (mocked for SVG Bar Chart)
    const monthlyCompletions = [
        { label: 'Jan', value: 8 },
        { label: 'Feb', value: 12 },
        { label: 'Mar', value: 15 },
        { label: 'Apr', value: 10 },
        { label: 'May', value: 18 },
        { label: 'Jun', value: 24 }
    ];

    const chartHeight = 120;
    const chartWidth = 500;
    const maxVal = Math.max(...monthlyCompletions.map(m => m.value));

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
                    <h1 className="text-3xl font-heading font-black tracking-tight">Worker Analytics</h1>
                    <p className="text-slate-400 text-sm">Review detailed graphs and metrics on job performance and customer ratings.</p>
                </div>

                {/* Key Metrics grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-1 text-center">
                        <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Acceptance Rate</p>
                        <p className="text-2xl font-heading font-black text-white">{acceptanceRate}%</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-1 text-center">
                        <Award className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jobs Finished</p>
                        <p className="text-2xl font-heading font-black text-white">{totalJobs} Jobs</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-1 text-center">
                        <Star className="w-6 h-6 text-amber-500 fill-current mx-auto mb-1" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Rating</p>
                        <p className="text-2xl font-heading font-black text-white">{averageRating} / 5</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl space-y-1 text-center">
                        <Clock className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Response Time</p>
                        <p className="text-2xl font-heading font-black text-white">12 Mins</p>
                    </div>
                </div>

                {/* Monthly completions SVG bar chart */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Jobs Completed Monthly</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Growth Metrics</span>
                    </div>

                    <div className="w-full overflow-x-auto py-4">
                        <div className="min-w-[500px]">
                            <svg className="w-full h-[150px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                                {/* Grid lines */}
                                <line x1="20" y1="20" x2="480" y2="20" stroke="#334155" strokeWidth="0.8" strokeDasharray="5, 5" />
                                <line x1="20" y1="60" x2="480" y2="60" stroke="#334155" strokeWidth="0.8" strokeDasharray="5, 5" />
                                <line x1="20" y1="100" x2="480" y2="100" stroke="#334155" strokeWidth="0.8" strokeDasharray="5, 5" />

                                {/* Render bars */}
                                {monthlyCompletions.map((item, idx) => {
                                    const colWidth = 40;
                                    const gap = (chartWidth - 40 - colWidth * monthlyCompletions.length) / (monthlyCompletions.length - 1);
                                    const x = 20 + idx * (colWidth + gap);
                                    const barHeight = (item.value / maxVal) * (chartHeight - 30);
                                    const y = chartHeight - barHeight - 10;

                                    return (
                                        <g key={idx} className="group cursor-pointer">
                                            {/* Bar */}
                                            <rect
                                                x={x}
                                                y={y}
                                                width={colWidth}
                                                height={barHeight}
                                                fill="#F59E0B"
                                                rx="6"
                                                className="transition-colors hover:fill-orange-500 duration-200"
                                            />
                                            {/* Tooltip value */}
                                            <text x={x + colWidth / 2} y={y - 8} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">{item.value} Jobs</text>
                                            
                                            {/* Month Label */}
                                            <text x={x + colWidth / 2} y={chartHeight} textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="bold">{item.label}</text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Rating statistics details */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Performance Overview</h3>
                    <div className="space-y-4 text-xs font-semibold text-slate-300">
                        <p className="leading-relaxed">Your account metrics are in excellent health. Maintaining a high acceptance rate (above 85%) and rating (above 4.6) will boost your visibility ranking inside customer search results.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
