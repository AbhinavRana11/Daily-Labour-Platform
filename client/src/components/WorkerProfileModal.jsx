import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, ShieldCheck, Clock, MessageSquare, Briefcase, Award, Languages, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReviewCard from './ReviewCard';

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

const WorkerProfileModal = ({ isOpen, onClose, labour, onBook }) => {
    const [reviewsList, setReviewsList] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        if (isOpen && labour) {
            const fetchReviews = async () => {
                setLoadingReviews(true);
                try {
                    const res = await axios.get(`http://localhost:5000/api/reviews/${labour._id || labour.id}`);
                    setReviewsList(res.data);
                } catch (error) {
                    console.error("Failed to load worker reviews:", error);
                } finally {
                    setLoadingReviews(false);
                }
            };
            fetchReviews();
        }
    }, [isOpen, labour]);

    if (!isOpen || !labour) return null;

    const avatar = getAvatarUrl(labour.username || labour.name);
    
    // Rating Breakdown calculation
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach(r => {
        const ratingRound = Math.round(r.rating || 5);
        if (ratingBreakdown[ratingRound] !== undefined) {
            ratingBreakdown[ratingRound]++;
        }
    });

    const completedJobs = labour.completedJobs || Math.floor(Math.random() * 200) + 50;
    const responseTime = labour.responseTime || "15 mins";
    const experience = labour.experience || labour.exp || 5;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
                >
                    {/* Top Action Header */}
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <span className="text-sm font-bold text-slate-500 flex items-center space-x-1.5">
                            <ShieldCheck className="w-4.5 h-4.5 text-green-500" />
                            <span>Verified Profile</span>
                        </span>
                        <button 
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center border border-slate-200/50 shadow-sm transition-all"
                        >
                            <X className="w-4.5 h-4.5" />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        {/* Header Details */}
                        <div className="flex items-center space-x-5">
                            <div className="relative">
                                <img
                                    src={avatar}
                                    alt={labour.username}
                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-md"
                                />
                                <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-green-500 border-2 border-white rounded-full" title="Online"></span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-heading font-black text-slate-900 leading-tight">
                                    {labour.username}
                                </h3>
                                <p className="text-primary font-bold text-sm tracking-wider uppercase">
                                    {labour.profession}
                                </p>
                                <div className="flex items-center space-x-1.5 text-sm text-slate-500 font-semibold">
                                    <div className="flex items-center text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-black ml-1">{labour.rating || 4.8}</span>
                                    </div>
                                    <span className="text-slate-350">•</span>
                                    <span>{completedJobs} Jobs Done</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                <Award className="w-5 h-5 text-primary mx-auto mb-1.5" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                                <p className="text-sm font-extrabold text-slate-800 mt-0.5">{experience} Years</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                <Clock className="w-5 h-5 text-primary mx-auto mb-1.5" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response</p>
                                <p className="text-sm font-extrabold text-slate-800 mt-0.5">{responseTime}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                <Languages className="w-5 h-5 text-primary mx-auto mb-1.5" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Languages</p>
                                <p className="text-xs font-extrabold text-slate-800 mt-0.5 truncate">Hindi, Punjabi</p>
                            </div>
                        </div>

                        {/* About Biography */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">About</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {labour.bio || `Highly skilled and reliable ${labour.profession} with over ${experience} years of experience handling residential and commercial installations, maintenance, and emergency repairs. Fully equipped with modern tools and committed to clean, timely work.`}
                            </p>
                        </div>

                        {/* Skills pills row */}
                        {labour.skills && labour.skills.length > 0 && (
                            <div className="space-y-2.5">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {labour.skills.map((skill) => (
                                        <span key={skill} className="bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-200/50">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certificates verified badges */}
                        {labour.certificates && labour.certificates.length > 0 && (
                            <div className="space-y-2.5">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Certificates</h4>
                                <div className="space-y-2">
                                    {labour.certificates.map((cert) => (
                                        <div key={cert} className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <ShieldCheck className="w-4.5 h-4.5 text-green-500 shrink-0" />
                                            <span>{cert}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Work Gallery / Portfolio Grid */}
                        {labour.portfolio && labour.portfolio.length > 0 && (
                            <div className="space-y-2.5">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Previous Work Portfolio</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {labour.portfolio.map((imgUrl, i) => (
                                        <div key={i} className="w-full h-32 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:opacity-95 transition-all">
                                            <img src={imgUrl} alt={`Work proof ${i + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <hr className="border-slate-100" />

                        {/* Rating Breakdown Section */}
                        <div className="space-y-3.5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Rating Breakdown</h4>
                            <div className="space-y-2.5">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = ratingBreakdown[stars];
                                    const total = reviewsList.length || 1;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div key={stars} className="flex items-center space-x-3 text-xs font-bold text-slate-600">
                                            <span className="w-14 shrink-0 flex items-center space-x-1">
                                                <span>{stars}</span>
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                                            </span>
                                            <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right text-slate-400">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reviews list */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex justify-between items-center">
                                <span>Recent Reviews ({reviewsList.length})</span>
                            </h4>

                            <div className="space-y-3.5">
                                {loadingReviews ? (
                                    <div className="text-center text-slate-400 py-6 text-sm">Loading reviews...</div>
                                ) : reviewsList.length > 0 ? (
                                    reviewsList.map((rev, index) => (
                                        <ReviewCard key={rev._id || index} review={rev} />
                                    ))
                                ) : (
                                    <div className="text-center text-slate-450 py-8 text-xs font-bold uppercase tracking-wider bg-slate-50/30 rounded-2xl border border-slate-100 border-dashed">
                                        No reviews posted yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Booking Panel Footer */}
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Hourly Rate</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">
                                ₹{labour.rate}<span className="text-sm font-normal text-slate-500">/hr</span>
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                onBook(labour);
                            }}
                            className="bg-primary hover:bg-primaryDark text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-2 text-base cursor-pointer"
                        >
                            <span>Book Now</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WorkerProfileModal;
