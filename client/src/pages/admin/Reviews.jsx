import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Star, Trash2, ArrowLeft, ShieldAlert, Award, Calendar, 
    User, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminReviews = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Fetch all workers first
            const laboursRes = await axios.get('http://localhost:5000/api/auth/labours');
            
            // Loop and fetch reviews for each worker
            const allPlatformReviews = [];
            for (const worker of laboursRes.data) {
                const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/${worker._id}`);
                reviewsRes.data.forEach(rev => {
                    allPlatformReviews.push({
                        ...rev,
                        labour: worker
                    });
                });
            }
            // Sort by latest
            allPlatformReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setReviews(allPlatformReviews);
        } catch (err) {
            console.error("Error loading platform reviews moderation list:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchAllReviews();
    }, [user, navigate]);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete/moderate this customer review?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            alert("Review deleted successfully.");
        } catch (err) {
            console.error("Failed to moderate review:", err);
            alert("Failed to moderate review.");
        }
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
                    <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2.5">
                        <Star className="w-8 h-8 text-amber-500 fill-current" />
                        <span>Platform Reviews Moderation</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Review, monitor, and remove inappropriate customer feedback posted on handyman accounts.</p>
                </div>

                {/* Reviews Moderation List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-455 font-semibold">Loading platform reviews...</div>
                    ) : reviews.length > 0 ? (
                        <AnimatePresence>
                            {reviews.map((rev) => (
                                <motion.div
                                    key={rev._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in"
                                >
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-2.5">
                                            <h4 className="font-bold text-white text-sm">Reviewer: {rev.user?.username || 'Client'}</h4>
                                            <span className="text-slate-500">➔</span>
                                            <h4 className="font-bold text-primary text-sm">Worker: {rev.labour?.username} ({rev.labour?.profession})</h4>
                                        </div>

                                        {/* Rating Stars */}
                                        <div className="flex items-center text-amber-500 space-x-0.5 pt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? 'fill-current' : 'text-slate-650'}`} 
                                                />
                                            ))}
                                        </div>

                                        <p className="text-slate-300 text-xs italic mt-2 leading-relaxed">"{rev.comment}"</p>
                                        
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-1 flex items-center">
                                            <Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(rev.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteReview(rev._id)}
                                        className="p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-900 rounded-2xl text-red-400 transition-all shrink-0 cursor-pointer self-end sm:self-center"
                                        title="Delete Review"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-16 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                            No reviews posted on the platform yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
