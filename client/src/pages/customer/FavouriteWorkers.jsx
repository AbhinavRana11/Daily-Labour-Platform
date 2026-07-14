import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Hammer, ArrowLeft, Heart, Sparkles, MessageSquare, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import BookingModal from '../../components/BookingModal';

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

const FavouriteWorkers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLabour, setBookingLabour] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchFavourites = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/auth/labours?lat=28.6139&lng=77.2090&radius=15`);
                setFavourites(res.data.slice(0, 3)); 
            } catch (err) {
                console.error("Failed to load favourites:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, [user, navigate]);

    const handleBook = (worker) => {
        setBookingLabour(worker);
        setIsBookingOpen(true);
    };

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

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2">
                            <Heart className="w-8 h-8 text-red-500 fill-current" />
                            <span>Favourite Workers</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Book your favorite, highly trusted handymen again with one click.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="col-span-2 text-center py-12 text-slate-500 font-bold">Loading favourites...</div>
                    ) : favourites.length > 0 ? (
                        favourites.map(worker => (
                            <motion.div 
                                key={worker._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-3xl shadow-xl flex justify-between items-center"
                            >
                                <div className="flex items-center space-x-3.5">
                                    <img src={getAvatarUrl(worker.username)} alt="" className="w-14 h-14 rounded-2xl object-cover bg-slate-755 border border-slate-700" />
                                    <div>
                                        <h4 className="font-heading font-black text-white text-base leading-none">{worker.username}</h4>
                                        <p className="text-primary font-bold text-xs uppercase tracking-wider mt-2">{worker.profession}</p>
                                        
                                        <div className="flex items-center text-amber-500 text-xs font-bold mt-1.5 space-x-2">
                                            <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                                            <span>{worker.rating || 4.9}</span>
                                            <span className="text-slate-550">•</span>
                                            <span className="text-slate-400">{worker.experience || 5} Yrs Exp</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 shrink-0">
                                    <button
                                        onClick={() => handleBook(worker)}
                                        className="py-2 px-4 bg-primary hover:bg-primaryDark text-white font-heading font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow shadow-orange-500/10 cursor-pointer"
                                    >
                                        Book Again
                                    </button>
                                    <button
                                        onClick={() => navigate(`/customer/worker-profile/${worker._id}`)}
                                        className="py-2 px-4 bg-slate-900 hover:bg-slate-850 text-white font-heading font-black text-[10px] uppercase tracking-wider rounded-xl border border-slate-800 text-center transition-colors cursor-pointer"
                                    >
                                        Profile
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-2 bg-slate-800/20 border border-slate-850 border-dashed p-10 rounded-3xl text-center text-slate-450 uppercase font-bold tracking-widest text-xs">
                            No favourite workers saved.
                        </div>
                    )}
                </div>

            </div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                labour={bookingLabour}
            />
        </div>
    );
};

export default FavouriteWorkers;
