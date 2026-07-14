import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Star, Calendar, ShieldCheck, Clock, MessageSquare, Briefcase, 
    Award, Languages, ThumbsUp, Phone, ChevronRight, X, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BookingModal from '../../components/BookingModal';
import ChatModal from '../../components/ChatModal';
import ReviewCard from '../../components/ReviewCard';

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

const WorkerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [labour, setLabour] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState(null);

    useEffect(() => {
        const fetchWorkerData = async () => {
            try {
                setLoading(true);
                // Fetch single worker details
                const workerRes = await axios.get(`http://localhost:5000/api/auth/labours/${id}`);
                setLabour(workerRes.data);

                // Fetch reviews
                const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/${id}`);
                setReviews(reviewsRes.data);
            } catch (err) {
                console.error("Error loading worker profile details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchWorkerData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
                <p className="text-base font-semibold">Loading profile information...</p>
            </div>
        );
    }

    if (!labour) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h3 className="text-2xl font-black">Worker Not Found</h3>
                <p className="text-slate-400 max-w-xs">The worker profile you are trying to view does not exist or has been deactivated.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-primary rounded-xl font-bold">Go Back</button>
            </div>
        );
    }

    const avatar = getAvatarUrl(labour.username);

    // Rating Breakdown calculation
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        const ratingRound = Math.round(r.rating || 5);
        if (ratingBreakdown[ratingRound] !== undefined) {
            ratingBreakdown[ratingRound]++;
        }
    });

    const experience = labour.experience || labour.exp || 5;
    const completedJobs = labour.completedJobs || Math.floor(Math.random() * 200) + 50;
    const responseTime = labour.responseTime || "15 mins";

    const handleOpenChat = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        const ids = [user._id, labour._id].sort();
        const chatId = ids.join('_');
        setChatRecipient({ ...labour, chatId });
        setIsChatOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Back button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Search</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: General Card details */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
                            
                            {/* Avatar */}
                            <div className="relative w-32 h-32 mx-auto">
                                <img 
                                    src={avatar} 
                                    alt={labour.username} 
                                    className="w-full h-full rounded-3xl object-cover border-4 border-slate-750 shadow-xl"
                                />
                                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-slate-800 rounded-full"></span>
                            </div>

                            {/* Name profession */}
                            <div>
                                <h2 className="text-2xl font-heading font-black tracking-tight flex items-center justify-center space-x-1.5">
                                    <span>{labour.username}</span>
                                    <ShieldCheck className="w-5 h-5 text-green-400" />
                                </h2>
                                <p className="text-primary font-bold text-xs uppercase tracking-wider mt-1">{labour.profession}</p>
                            </div>

                            <div className="flex items-center justify-center space-x-1 text-amber-500 font-extrabold text-sm">
                                <Star className="w-4.5 h-4.5 fill-current" />
                                <span className="text-white">{labour.rating || 4.8}</span>
                                <span className="text-slate-500 font-normal">({reviews.length} reviews)</span>
                            </div>

                            <hr className="border-slate-700/40" />

                            {/* Service cost panel */}
                            <div className="text-center bg-slate-800/60 p-4 rounded-2xl border border-slate-700/30">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hourly Cost</p>
                                <p className="text-3xl font-heading font-black text-white mt-1">
                                    ₹{labour.rate}<span className="text-xs font-normal text-slate-400">/hr</span>
                                </p>
                            </div>

                            {/* Book action panel */}
                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={() => setIsBookingOpen(true)}
                                    className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm uppercase tracking-wider cursor-pointer"
                                >
                                    Book Handyman Now
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={`tel:${labour.phone || '9876543210'}`}
                                        className="py-3 bg-slate-700 hover:bg-slate-650 text-white font-bold rounded-xl border border-slate-600/50 transition-colors flex items-center justify-center space-x-1.5 text-xs"
                                    >
                                        <Phone className="w-4 h-4 text-slate-350" />
                                        <span>Call</span>
                                    </a>
                                    <button
                                        onClick={handleOpenChat}
                                        className="py-3 bg-slate-700 hover:bg-slate-650 text-white font-bold rounded-xl border border-slate-600/50 transition-colors flex items-center justify-center space-x-1.5 text-xs"
                                    >
                                        <MessageSquare className="w-4 h-4 text-slate-350" />
                                        <span>Chat</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Biography, stats breakdown, portfolio */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Stats Dashboard Info */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-4 rounded-3xl text-center">
                                <Award className="w-6 h-6 text-primary mx-auto mb-1.5" />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                                <p className="text-base font-heading font-black text-white mt-0.5">{experience} Years</p>
                            </div>
                            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-4 rounded-3xl text-center">
                                <Clock className="w-6 h-6 text-primary mx-auto mb-1.5" />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Response</p>
                                <p className="text-base font-heading font-black text-white mt-0.5">{responseTime}</p>
                            </div>
                            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-4 rounded-3xl text-center">
                                <Languages className="w-6 h-6 text-primary mx-auto mb-1.5" />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Languages</p>
                                <p className="text-xs font-heading font-black text-white mt-1 truncate">Hindi, Punjabi</p>
                            </div>
                        </div>

                        {/* Professional Bio */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Professional Bio</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {labour.bio || `Highly skilled and reliable ${labour.profession} with over ${experience} years of experience handling residential and commercial installations, maintenance, and emergency repairs. Fully equipped with modern tools and committed to clean, timely work.`}
                            </p>
                        </div>

                        {/* Portfolio section */}
                        {labour.portfolio && labour.portfolio.length > 0 && (
                            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Previous Work Portfolio</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {labour.portfolio.map((imgUrl, idx) => (
                                        <div key={idx} className="h-28 rounded-2xl overflow-hidden border border-slate-700 shadow-sm relative group hover:opacity-95 transition-opacity">
                                            <img src={imgUrl} alt={`Portfolio work ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rating Breakdown Section */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Rating Breakdown</h3>
                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = ratingBreakdown[stars];
                                    const total = reviews.length || 1;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div key={stars} className="flex items-center space-x-3 text-xs font-bold text-slate-350">
                                            <span className="w-14 shrink-0 flex items-center space-x-1">
                                                <span>{stars}</span>
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                                            </span>
                                            <div className="flex-grow h-2 bg-slate-850 rounded-full overflow-hidden border border-slate-750">
                                                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right text-slate-400">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reviews list */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Recent Reviews ({reviews.length})</h3>
                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((rev, index) => (
                                        <div key={rev._id || index} className="border-b border-slate-700/30 pb-4 last:border-b-0 last:pb-0">
                                            <ReviewCard review={rev} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-slate-500 text-xs font-bold uppercase tracking-wider">No reviews posted yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                labour={labour}
            />

            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipient={chatRecipient}
            />
        </div>
    );
};

export default WorkerProfile;
