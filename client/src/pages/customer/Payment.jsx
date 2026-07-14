import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CreditCard, DollarSign, Download, Printer, Share2, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Payment = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data.filter(b => b.status === 'completed' || b.paymentStatus === 'paid'));
            } catch (err) {
                console.error("Failed to load invoice history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Back</span>
                </button>

                <div>
                    <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2">
                        <CreditCard className="w-8 h-8 text-primary animate-pulse" />
                        <span>Payment & Invoices</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Review estimated vs final costs, transaction receipts, and download PDF invoices.</p>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500 font-bold">Loading payment receipts...</div>
                    ) : bookings.length > 0 ? (
                        bookings.map(item => {
                            const platformFee = 50;
                            const taxes = Math.round(item.totalPrice * 0.18);
                            const grossTotal = item.totalPrice + platformFee + taxes;

                            return (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="space-y-3.5 flex-grow">
                                        <div className="flex items-center space-x-2 flex-wrap">
                                            <span className="text-[10px] font-heading font-black text-primary uppercase bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full leading-none">
                                                ID: {item.bookingId || `#BK${item._id.slice(-4).toUpperCase()}`}
                                            </span>
                                            <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full font-black uppercase">
                                                Paid
                                            </span>
                                            <span className="text-slate-400 text-xs font-semibold">{new Date(item.date).toLocaleDateString()}</span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-350">
                                            <div>
                                                <p className="text-[9px] text-slate-500 uppercase font-black">Estimated Cost</p>
                                                <p className="text-white text-sm font-extrabold mt-1">₹{item.estimatedPrice || item.totalPrice || 600}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-500 uppercase font-black">Final Cost</p>
                                                <p className="text-white text-sm font-extrabold mt-1">₹{item.finalPrice || item.totalPrice || 580}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-500 uppercase font-black">Commission</p>
                                                <p className="text-slate-450 text-sm mt-1 font-semibold">₹{Math.round((item.finalPrice || item.totalPrice) * 0.15)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-500 uppercase font-black">Total Paid Amount</p>
                                                <p className="text-primary text-sm font-heading font-black mt-1">₹{grossTotal}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 md:self-center">
                                        <button
                                            onClick={() => alert("Mock Invoice PDF generated and downloaded.")}
                                            className="p-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-800"
                                            title="Download Invoice"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => window.print()}
                                            className="p-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-800"
                                            title="Print Invoice"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="bg-slate-800/20 border border-slate-850 border-dashed p-12 rounded-3xl text-center text-slate-450 uppercase font-bold tracking-widest text-xs">
                            No payment history receipts found.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Payment;
