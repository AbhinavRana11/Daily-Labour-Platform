import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Star, MessageSquare, Calendar, User, Trash2, ShieldCheck, 
    ArrowLeft, ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const CustomerReviews = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetch bookings or reviews
                // Since getWorkerReviews is route-based, we fetch reviews for all workers or bookings
                // Or we can find reviews written by user by querying bookings and their reviews
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Get completed bookings that might have reviews
                const completed = res.data.filter(b => b.status === 'completed');
                
                // Fetch reviews for each completed booking labourer to find customer reviews
                const customerReviews = [];
                for (const booking of completed) {
                    if (booking.labour) {
                        const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/${booking.labour._id}`);
                        // Filter reviews written by current user
                        const userReviews = reviewsRes.data.filter(r => r.user?._id === user._id || r.user === user._id);
                        userReviews.forEach(rev => {
                            customerReviews.push({
                                ...rev,
                                booking,
                                labour: booking.labour
                            });
                        });
                    }
                }
                setReviews(customerReviews);
            } catch (err) {
                console.error("Failed to load customer reviews history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [user, navigate]);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            alert("Review deleted successfully.");
        } catch (err) {
            console.error("Failed to delete review:", err);
            alert("Failed to delete review. Only authorized authors can delete.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="space-y-1">
                    <h1 className="text-3xl font-heading font-black tracking-tight">My Reviews & Ratings</h1>
                    <p className="text-slate-400 text-sm">Monitor and manage the reviews and star feedback you have submitted to workers.</p>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 font-semibold">Loading reviews history...</div>
                    ) : reviews.length > 0 ? (
                        <AnimatePresence>
                            {reviews.map((rev) => {
                                const emoji = getProfessionEmoji(rev.labour?.profession);
                                return (
                                    <motion.div
                                        key={rev._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <span className="text-4xl bg-slate-900/40 p-3 rounded-2xl border border-slate-750 shrink-0">{emoji}</span>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-white flex items-center space-x-1.5">
                                                    <span>{rev.labour?.username}</span>
                                                    <ShieldCheck className="w-4.5 h-4.5 text-green-400" />
                                                </h4>
                                                <p className="text-primary font-bold text-xs uppercase tracking-wider">{rev.labour?.profession}</p>
                                                
                                                {/* Rating stars */}
                                                <div className="flex items-center text-amber-500 space-x-0.5 pt-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? 'fill-current' : 'text-slate-600'}`} 
                                                        />
                                                    ))}
                                                </div>

                                                <p className="text-slate-300 text-sm leading-relaxed mt-2 italic">"{rev.comment}"</p>
                                                
                                                <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-2">
                                                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(rev.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteReview(rev._id)}
                                            className="p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-900 rounded-2xl text-red-400 transition-all flex items-center justify-center cursor-pointer self-end sm:self-center"
                                            title="Delete review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-16 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                            No reviews submitted yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerReviews;
