import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Star, Calendar, ShieldCheck, ArrowLeft, MessageSquare 
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReviewCard from '../../components/ReviewCard';

const WorkerReviews = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchWorkerReviews = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/reviews/${user._id}`);
                setReviews(res.data);
            } catch (err) {
                console.error("Error loading worker reviews:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkerReviews();
    }, [user, navigate]);

    // Star distribution calculation
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        const ratingRound = Math.round(r.rating || 5);
        if (ratingBreakdown[ratingRound] !== undefined) {
            ratingBreakdown[ratingRound]++;
        }
    });

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
                    <h1 className="text-3xl font-heading font-black tracking-tight">Customer Reviews</h1>
                    <p className="text-slate-400 text-sm">Review comments, feedback, and star ratings submitted by clients you served.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Star breakdown */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Rating Distribution</h3>
                            
                            <div className="space-y-3.5">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = ratingBreakdown[stars];
                                    const total = reviews.length || 1;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div key={stars} className="flex items-center space-x-3 text-xs font-bold text-slate-300">
                                            <span className="w-10 shrink-0 flex items-center space-x-1">
                                                <span>{stars}</span>
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                                            </span>
                                            <div className="flex-grow h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-750">
                                                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right text-slate-400">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Reviews List */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="text-center py-6 text-slate-400">Loading reviews...</div>
                        ) : reviews.length > 0 ? (
                            reviews.map((rev, idx) => (
                                <div key={rev._id || idx} className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl shadow-xl">
                                    <ReviewCard review={rev} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                                No customer reviews received yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerReviews;
