import React from 'react';
import { Star, MapPin, Clock, ShieldCheck, Briefcase, Phone, MessageSquare } from 'lucide-react';
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

// Haversine distance calculator for fallback values
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
};

const LabourCard = ({ labour, onBook, onChat, onProfileClick, isSelected, customerLoc }) => {
    const avatar = getAvatarUrl(labour.username || labour.name);
    
    // Status definitions: 🟢 Online, 🟠 Busy, ⚫ Offline
    // Default to Online if available, or randomize for demonstration if not set
    const status = labour.isAvailable 
        ? { dot: 'bg-green-500 animate-pulse', text: 'Online', textColor: 'text-green-600' }
        : { dot: 'bg-orange-500', text: 'Busy', textColor: 'text-orange-500' };

    // Proximity/Distance check
    let distanceStr = labour.distance || "1.5";
    if (customerLoc && labour.location?.coordinates) {
        const [lng, lat] = labour.location.coordinates;
        distanceStr = calculateDistance(customerLoc.lat, customerLoc.lng, lat, lng);
    }

    const completedJobs = labour.completedJobs || Math.floor(Math.random() * 200) + 50;
    const responseTime = labour.responseTime || "15 mins";
    const experience = labour.experience || labour.exp || 5;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-3xl p-5 border transition-all shadow-md hover:shadow-lg ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100'}`}
        >
            <div className="flex items-start gap-4">
                {/* Profile Avatar & Live Status Dot */}
                <div className="relative shrink-0">
                    <img
                        src={avatar}
                        alt={labour.username || labour.name}
                        onClick={(e) => {
                            e.stopPropagation(); // Don't trigger card selection
                            if (onProfileClick) onProfileClick(labour);
                        }}
                        className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-100 hover:opacity-95 transition-opacity"
                    />
                    {/* Status Dot overlay */}
                    <span 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${status.dot}`}
                        title={status.text}
                    ></span>
                </div>

                {/* Worker Primary Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base leading-snug flex items-center gap-1.5 truncate">
                                <span>{labour.username || labour.name}</span>
                                <ShieldCheck className="w-4.5 h-4.5 text-green-500 shrink-0" title="Verified Worker" />
                            </h3>
                            <p className="text-primary font-bold text-xs tracking-wider uppercase">
                                {labour.profession}
                            </p>
                        </div>
                        
                        {/* Rating block */}
                        <div className="flex items-center space-x-0.5 text-amber-500 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-slate-800 text-xs font-black">{labour.rating || 4.8}</span>
                        </div>
                    </div>

                    {/* Stats List */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 text-slate-500 text-xs">
                        <div className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                            <span className="truncate">{distanceStr} km away</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                            <span className="truncate">{responseTime} response</span>
                        </div>
                        <div className="flex items-center">
                            <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                            <span className="truncate">{experience} years exp</span>
                        </div>
                        <div className="flex items-center">
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${labour.isAvailable ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                            <span className="truncate font-semibold text-slate-600">{status.text}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost & Quick Actions */}
            <div className="flex justify-between items-center border-t border-slate-50 mt-4 pt-3.5">
                <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visit Rate</span>
                    <span className="text-lg font-black text-slate-900 leading-none">
                        ₹{labour.rate}<span className="text-xs font-normal text-slate-500">/hr</span>
                    </span>
                </div>

                <div className="flex space-x-2">
                    <a 
                        href={`tel:${labour.phone || '9876543210'}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-100 transition-colors"
                        title="Call Worker"
                    >
                        <Phone className="w-4 h-4 text-slate-600" />
                    </a>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onChat) onChat(labour);
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-100 transition-colors"
                        title="Message Worker"
                    >
                        <MessageSquare className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onBook(labour);
                        }}
                        className="bg-secondary hover:bg-secondaryLight text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default LabourCard;
