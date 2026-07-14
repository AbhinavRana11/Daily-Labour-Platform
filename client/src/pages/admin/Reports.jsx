import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FileText, ArrowLeft, BarChart2, ShieldAlert, CheckCircle, 
    XCircle, Calendar, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminReports = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchReportsData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
            } catch (err) {
                console.error("Error loading admin reports bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReportsData();
    }, [user, navigate]);

    // Data analytics counts
    const completedCount = bookings.filter(b => b.status === 'completed').length;
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const acceptedCount = bookings.filter(b => b.status === 'accepted').length;

    const grossRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const avgBookingVal = bookings.length > 0 ? Math.round(grossRevenue / bookings.length) : 0;

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
                    <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2.5">
                        <FileText className="w-8 h-8 text-primary" />
                        <span>System Reports & Analytics</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Aggregate revenue metrics, booking success rates, and dispute cancellations logs.</p>
                </div>

                {/* Grid performance cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl text-center space-y-1">
                        <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1.5" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed Jobs</p>
                        <p className="text-xl font-heading font-black text-white">{completedCount}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl text-center space-y-1">
                        <XCircle className="w-6 h-6 text-red-400 mx-auto mb-1.5" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cancelled Jobs</p>
                        <p className="text-xl font-heading font-black text-white">{cancelledCount}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl text-center space-y-1">
                        <Calendar className="w-6 h-6 text-primary mx-auto mb-1.5" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending/Scheduled</p>
                        <p className="text-xl font-heading font-black text-white">{pendingCount + acceptedCount}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl text-center space-y-1">
                        <DollarSign className="w-6 h-6 text-primary mx-auto mb-1.5" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Booking</p>
                        <p className="text-xl font-heading font-black text-primary">₹{avgBookingVal}</p>
                    </div>
                </div>

                {/* Dispute / Cancel log audit */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-350 flex items-center space-x-2">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                        <span>Disputed / Cancelled Bookings log</span>
                    </h3>
                    
                    <div className="divide-y divide-slate-800">
                        {loading ? (
                            <div className="text-center py-6 text-slate-400">Loading audit statements...</div>
                        ) : bookings.filter(b => b.status === 'cancelled').length > 0 ? (
                            bookings.filter(b => b.status === 'cancelled').map(item => (
                                <div key={item._id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center text-xs text-slate-300 font-semibold pt-3.5">
                                    <div>
                                        <p className="text-white font-bold">{item.user?.username || 'Client'} ➔ {item.labour?.username || 'Worker'}</p>
                                        <p className="text-[9px] text-slate-500 mt-0.5">Reason: Customer Cancelled</p>
                                    </div>
                                    <span className="text-slate-450 font-bold">₹{item.totalPrice}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-wider">No audit cancellations logged</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
