import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import LabourCard from '../components/LabourCard';
import BookingModal from '../components/BookingModal';
import WorkerProfileModal from '../components/WorkerProfileModal';
import ChatModal from '../components/ChatModal';
import { Search, Compass, Star, MapPin, Sparkles, Filter, X, Phone, MessageSquare, Navigation, Info, RefreshCw, ArrowUp, ShieldCheck, Zap, Calculator, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Number((R * c).toFixed(1));
};

const FindLabour = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfession, setSelectedProfession] = useState('All');
    const [searchRadius, setSearchRadius] = useState(10); 
    const [minRating, setMinRating] = useState(0);
    const [availableOnly, setAvailableOnly] = useState(false);
    
    // Geolocation
    const [customerLoc, setCustomerLoc] = useState(null);
    const [geoLoading, setGeoLoading] = useState(false);
    
    // Modals
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingLabour, setBookingLabour] = useState(null);
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileLabour, setProfileLabour] = useState(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState(null);
    
    // Selected worker
    const [selectedLabour, setSelectedLabour] = useState(null);
    const [routeHUD, setRouteHUD] = useState(null);

    const handleOpenChat = (recipient) => {
        if (!user) {
            navigate('/login');
            return;
        }
        const ids = [user._id, recipient._id].sort();
        const chatId = ids.join('_');
        setChatRecipient({ ...recipient, chatId });
        setIsChatOpen(true);
    };

    // Dynamic Features States (Step 2)
    const [showEstimator, setShowEstimator] = useState(false);
    const [instantHiringActive, setInstantHiringActive] = useState(false);
    
    // Estimator Forms State
    const [estimateCategory, setEstimateCategory] = useState('Painter');
    const [estimateScale, setEstimateScale] = useState('2 Rooms');
    const [estimateUrgency, setEstimateUrgency] = useState('Urgent');
    const [estimatedRange, setEstimatedRange] = useState(null);

    // Labours list
    const [labours, setLabours] = useState([]);
    const [loading, setLoading] = useState(true);

    const sidebarRef = useRef(null);

    // Ask for customer location on mount
    useEffect(() => {
        setGeoLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCustomerLoc({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setGeoLoading(false);
                },
                (error) => {
                    console.warn("Geolocation permission error, falling back:", error);
                    setCustomerLoc({ lat: 28.6139, lng: 77.2090 }); 
                    setGeoLoading(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setCustomerLoc({ lat: 28.6139, lng: 77.2090 });
            setGeoLoading(false);
        }
    }, []);

    // Fetch labours dynamically
    useEffect(() => {
        const fetchLabours = async () => {
            if (!customerLoc) return;
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/auth/labours?lat=${customerLoc.lat}&lng=${customerLoc.lng}&radius=${searchRadius}`);
                setLabours(res.data);
            } catch (error) {
                console.error("Error fetching labours:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLabours();
    }, [customerLoc, searchRadius]);

    // Update Route HUD
    useEffect(() => {
        if (customerLoc && selectedLabour && selectedLabour.location?.coordinates) {
            const [lng, lat] = selectedLabour.location.coordinates;
            const dist = calculateDistance(customerLoc.lat, customerLoc.lng, lat, lng);
            const duration = Math.max(3, Math.round((dist / 25) * 60)); 
            setRouteHUD({
                distance: dist,
                duration: duration
            });
        } else {
            setRouteHUD(null);
        }
    }, [customerLoc, selectedLabour]);

    // Apply filters client-side
    const filteredLabourers = labours.filter(l => {
        const matchesProfession = selectedProfession === 'All' || l.profession === selectedProfession;
        const matchesSearch = (l.username && l.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (l.profession && l.profession.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRating = (l.rating || 4.5) >= minRating;
        const matchesAvailability = !availableOnly || l.isAvailable;
        return matchesProfession && matchesSearch && matchesRating && matchesAvailability;
    });

    // Best Match AI Recommendation Card
    const bestMatchWorker = (() => {
        if (filteredLabourers.length === 0) return null;
        
        let bestWorker = null;
        let highestScore = -1;

        filteredLabourers.forEach(worker => {
            let distance = 5;
            if (customerLoc && worker.location?.coordinates) {
                const [lng, lat] = worker.location.coordinates;
                distance = calculateDistance(customerLoc.lat, customerLoc.lng, lat, lng);
            }

            const rating = worker.rating || 4.5;
            const exp = worker.experience || worker.exp || 3;
            const rate = worker.rate || 300;
            const availabilityScore = worker.isAvailable ? 10 : 0;

            const score = (rating * 4) + (exp * 0.9) + availabilityScore + ((30 - distance) * 0.7) - (rate * 0.01);
            if (score > highestScore) {
                highestScore = score;
                bestWorker = worker;
            }
        });

        // Compute match percentage
        if (bestWorker) {
            let distance = 3;
            if (customerLoc && bestWorker.location?.coordinates) {
                const [lng, lat] = bestWorker.location.coordinates;
                distance = calculateDistance(customerLoc.lat, customerLoc.lng, lat, lng);
            }
            const ratingScore = ((bestWorker.rating || 4.8) / 5) * 40;
            const distanceScore = Math.max(0, (20 - distance) / 20) * 30;
            const expScore = Math.min(10, bestWorker.experience || bestWorker.exp || 5) * 3;
            bestWorker.matchPercentage = Math.min(99, Math.round(ratingScore + distanceScore + expScore));

            const reasons = [];
            if (distance <= 5) reasons.push("Near You");
            if ((bestWorker.rating || 4.5) >= 4.7) reasons.push("Highly Rated");
            if (bestWorker.rate <= 300) reasons.push("Affordable");
            if ((bestWorker.experience || bestWorker.exp || 5) >= 5) reasons.push("Experienced");
            bestWorker.matchReasons = reasons.length > 0 ? reasons : ["Highly Rated"];
        }

        return bestWorker;
    })();

    // Remove Best Match from general list
    const otherLabourers = filteredLabourers.filter(l => !bestMatchWorker || l._id !== bestMatchWorker._id);

    // Instant Hiring Matcher logic
    const handleInstantHire = () => {
        const onlineWorkers = filteredLabourers.filter(l => l.isAvailable);
        if (onlineWorkers.length === 0) {
            alert("No available handymen are online right now. Please select one manually.");
            return;
        }

        setInstantHiringActive(true);

        setTimeout(() => {
            // Find closest
            let closest = onlineWorkers[0];
            let minDistance = 9999;
            if (customerLoc) {
                onlineWorkers.forEach(w => {
                    if (w.location?.coordinates) {
                        const [lng, lat] = w.location.coordinates;
                        const dist = calculateDistance(customerLoc.lat, customerLoc.lng, lat, lng);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closest = w;
                        }
                    }
                });
            }

            setInstantHiringActive(false);
            setSelectedLabour(closest);
            handleOpenBook(closest);
        }, 1500);
    };

    // Cost Estimator calculation
    const handleCalculateEstimate = () => {
        let base = 300;
        if (estimateCategory === 'Painter') base = 1800;
        else if (estimateCategory === 'Mason') base = 1200;
        else if (estimateCategory === 'Carpenter') base = 500;
        else if (estimateCategory === 'Electrician') base = 400;
        else if (estimateCategory === 'Plumber') base = 450;
        else if (estimateCategory === 'Housekeeper') base = 600;

        let multiplier = 1.0;
        if (estimateScale === '2 Rooms') multiplier = 1.8;
        else if (estimateScale === 'Whole House') multiplier = 3.5;

        const urgencySurcharge = estimateUrgency === 'Urgent' ? 500 : 0;

        const total = (base * multiplier) + urgencySurcharge;
        // Generate range around total
        const low = Math.round((total * 0.9) / 50) * 50;
        const high = Math.round((total * 1.1) / 50) * 50;

        setEstimatedRange({ low, high });
    };

    const handleOpenBook = (labour) => {
        setBookingLabour(labour);
        setIsBookingOpen(true);
    };

    const handleOpenProfile = (labour) => {
        setProfileLabour(labour);
        setIsProfileOpen(true);
    };

    const handleResetFilters = () => {
        setSelectedProfession('All');
        setSearchRadius(10);
        setMinRating(0);
        setAvailableOnly(false);
        setSearchTerm('');
        setSelectedLabour(null);
    };

    const handleScrollToTop = () => {
        if (sidebarRef.current) {
            sidebarRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const requestGPS = () => {
        setGeoLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCustomerLoc({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setGeoLoading(false);
                },
                (error) => {
                    alert("Location access denied. Please enable GPS permissions.");
                    setGeoLoading(false);
                }
            );
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 font-sans">
            {/* 1. Horizontal Chips Filter Bar */}
            <section className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex flex-wrap gap-4 items-center justify-between shadow-sm shrink-0 z-20">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-1">
                        {['All', 'Plumber', 'Electrician', 'Carpenter', 'Housekeeper', 'Painter', 'Mason'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedProfession(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-heading font-black tracking-wide uppercase transition-all duration-300 border flex items-center space-x-1.5 cursor-pointer ${selectedProfession === cat ? 'bg-primary border-primary text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-350'}`}
                            >
                                <span>{getProfessionEmoji(cat)}</span>
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>

                    <div className="h-5 w-[1px] bg-slate-200 hidden lg:block"></div>

                    {/* Distance filter chips */}
                    <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                        {[2, 5, 10, 20].map(dist => (
                            <button
                                key={dist}
                                onClick={() => setSearchRadius(dist)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${searchRadius === dist ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {dist} KM
                            </button>
                        ))}
                    </div>

                    <div className="h-5 w-[1px] bg-slate-200 hidden lg:block"></div>

                    {/* Rating filter chips */}
                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                        {[0, 4, 4.5].map(rating => (
                            <button
                                key={rating}
                                onClick={() => setMinRating(rating)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center space-x-1 transition-all ${minRating === rating ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Star className="w-3 h-3 fill-current text-amber-500" />
                                <span>{rating === 0 ? 'All' : `${rating}+`}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Available Online Status Button */}
                <button
                    onClick={() => setAvailableOnly(!availableOnly)}
                    className={`px-4 py-2 rounded-full border text-xs font-black flex items-center space-x-2 transition-all cursor-pointer ${availableOnly ? 'bg-green-500/10 border-green-500 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                    <span className={`w-2.5 h-2.5 rounded-full ${availableOnly ? 'bg-green-500 animate-ping' : 'bg-slate-400'}`}></span>
                    <span>🟢 Online Now</span>
                </button>
            </section>

            {/* 2. Main Content Split Panel */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                
                {/* Left Side: Worker Cards & Recommendations */}
                <div 
                    ref={sidebarRef}
                    className="w-full md:w-[35%] lg:w-[28%] bg-white overflow-y-auto shadow-2xl z-10 flex flex-col h-full border-r border-slate-200/80 p-5 space-y-6 scrollbar-thin"
                >
                    {/* Header Statistics Dashboard Panel */}
                    <div className="grid grid-cols-3 gap-2.5 border-b border-slate-100 pb-5 text-center shrink-0 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nearby</p>
                            <p className="text-lg font-heading font-black text-slate-800 mt-0.5">{filteredLabourers.length}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available</p>
                            <p className="text-lg font-heading font-black text-green-600 mt-0.5">
                                {filteredLabourers.filter(l => l.isAvailable).length}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Booked Today</p>
                            <p className="text-lg font-heading font-black text-primary mt-0.5">54</p>
                        </div>
                    </div>

                    {/* Instant Matching Row & Price Estimator Buttons (Step 2) */}
                    <div className="grid grid-cols-2 gap-2.5 shrink-0">
                        <button
                            onClick={handleInstantHire}
                            disabled={instantHiringActive}
                            className={`py-3 px-2 bg-gradient-to-r from-primary to-orange-500 hover:from-primaryDark hover:to-orange-600 text-white font-bold rounded-2xl shadow-md flex items-center justify-center space-x-1.5 text-xs transition-all relative overflow-hidden cursor-pointer ${instantHiringActive ? 'animate-pulse opacity-90' : ''}`}
                        >
                            <Zap className="w-4 h-4 text-white animate-bounce shrink-0" />
                            <span>{instantHiringActive ? 'Matching...' : 'Need Worker Now'}</span>
                        </button>
                        <button
                            onClick={() => setShowEstimator(!showEstimator)}
                            className={`py-3 px-2 rounded-2xl border font-bold flex items-center justify-center space-x-1.5 text-xs transition-all cursor-pointer ${showEstimator ? 'bg-slate-900 border-transparent text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                        >
                            <Calculator className="w-4 h-4 text-primary shrink-0" />
                            <span>Price Estimator</span>
                        </button>
                    </div>

                    {/* Expandable Price Estimator Card (Step 2) */}
                    <AnimatePresence>
                        {showEstimator && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shrink-0 space-y-4 overflow-hidden"
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-heading font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                                        <Calculator className="w-3.5 h-3.5 text-primary" />
                                        <span>AI Price Estimator</span>
                                    </h4>
                                    <button onClick={() => { setShowEstimator(false); setEstimatedRange(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                                </div>

                                <div className="space-y-3.5 text-xs">
                                    {/* Category Select */}
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Service Category</label>
                                        <select 
                                            value={estimateCategory} 
                                            onChange={(e) => setEstimateCategory(e.target.value)}
                                            className="w-full bg-white border border-slate-200 py-2 px-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700"
                                        >
                                            <option value="Painter">Painting</option>
                                            <option value="Plumber">Plumbing</option>
                                            <option value="Electrician">Electrical Works</option>
                                            <option value="Carpenter">Carpentry Setup</option>
                                            <option value="Housekeeper">House Cleaning</option>
                                            <option value="Mason">Masonry Building</option>
                                        </select>
                                    </div>

                                    {/* Size/Scale Select */}
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Job Scale / Size</label>
                                        <select 
                                            value={estimateScale} 
                                            onChange={(e) => setEstimateScale(e.target.value)}
                                            className="w-full bg-white border border-slate-200 py-2 px-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700"
                                        >
                                            <option value="1 Room">1 Room / Minor Fix</option>
                                            <option value="2 Rooms">2 Rooms / Mid-scale</option>
                                            <option value="Whole House">Whole House / Full Repair</option>
                                        </select>
                                    </div>

                                    {/* Urgency */}
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Urgency Surcharges</label>
                                        <select 
                                            value={estimateUrgency} 
                                            onChange={(e) => setEstimateUrgency(e.target.value)}
                                            className="w-full bg-white border border-slate-200 py-2 px-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700"
                                        >
                                            <option value="Normal">Normal Schedule (1-2 Days)</option>
                                            <option value="Urgent">⚡ Urgent Match (Within 2 hrs)</option>
                                        </select>
                                    </div>

                                    {/* Estimate Output */}
                                    {estimatedRange ? (
                                        <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-100 text-center space-y-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Estimated Budget</p>
                                            <p className="text-lg font-heading font-black text-primary">₹{estimatedRange.low} - ₹{estimatedRange.high}</p>
                                            <p className="text-[9px] text-slate-400 leading-none">Approx range based on seed parameters.</p>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleCalculateEstimate}
                                            className="w-full bg-secondary hover:bg-secondaryLight text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                                        >
                                            Estimate Cost
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Worker List</span>
                        {selectedLabour && (
                            <button 
                                onClick={() => setSelectedLabour(null)}
                                className="text-xs text-primary font-bold hover:underline"
                            >
                                Clear Select
                            </button>
                        )}
                    </div>

                    {/* Best Match AI Recommendation Card */}
                    {bestMatchWorker && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-heading font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1 text-primary">
                                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                                    <span>Best Match</span>
                                </h3>
                                <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black py-0.5 px-2 rounded-full uppercase">
                                    ⭐ {bestMatchWorker.matchPercentage || 96}% Match
                                </span>
                            </div>
                            <div className="bg-amber-50/30 p-0.5 rounded-3xl border border-primary/20 hover:border-primary/45 transition-colors shadow-sm relative overflow-hidden">
                                <LabourCard
                                    labour={bestMatchWorker}
                                    onBook={handleOpenBook}
                                    onChat={handleOpenChat}
                                    onProfileClick={handleOpenProfile}
                                    isSelected={selectedLabour?._id === bestMatchWorker._id}
                                    customerLoc={customerLoc}
                                />
                                
                                {bestMatchWorker.matchReasons && (
                                    <div className="px-5 pb-4 pt-2 text-[11px] font-bold text-amber-900/80 bg-amber-500/5 border-t border-slate-100/60 flex flex-col space-y-1">
                                        <p className="text-[9px] text-primary uppercase font-black tracking-widest mt-0.5">Why?</p>
                                        <div className="flex flex-wrap gap-x-3.5 gap-y-1">
                                            {bestMatchWorker.matchReasons.map(reason => (
                                                <span key={reason} className="flex items-center space-x-1.5">
                                                    <span className="text-primary font-black">✔</span>
                                                    <span>{reason}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* General List of Workers */}
                    <div className="space-y-4 flex-1">
                        {loading ? (
                            <div className="text-center text-slate-400 py-16 text-sm">Searching nearby workers...</div>
                        ) : otherLabourers.length > 0 ? (
                            otherLabourers.map(labour => (
                                <div 
                                    key={labour._id} 
                                    onClick={() => setSelectedLabour(labour)}
                                    className="cursor-pointer"
                                >
                                    <LabourCard
                                        labour={labour}
                                        onBook={handleOpenBook}
                                        onChat={handleOpenChat}
                                        onProfileClick={handleOpenProfile}
                                        isSelected={selectedLabour?._id === labour._id}
                                        customerLoc={customerLoc}
                                    />
                                </div>
                            ))
                        ) : (
                            !bestMatchWorker && (
                                <div className="text-center text-slate-400 py-16 text-sm">No workers found in this range.</div>
                            )
                        )}
                    </div>
                </div>

                {/* Right Side: Map Canvas Area */}
                <div className="flex-1 h-full relative z-0">
                    {/* Floating Search Bar */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
                        <div className="bg-white rounded-full shadow-2xl border border-slate-200/50 p-2 flex items-center h-[56px] gap-2">
                            <div className="flex-1 relative flex items-center pl-4">
                                <Search className="text-slate-400 w-5 h-5 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search workers, profession, or location..."
                                    className="w-full bg-transparent border-none text-slate-800 text-sm focus:outline-none placeholder-slate-400 pl-3 pr-2 py-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')} 
                                        className="text-slate-400 hover:text-slate-600 p-1 mr-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <button
                                onClick={requestGPS}
                                className={`w-10 h-10 rounded-full hover:bg-slate-100 border border-slate-200/50 flex items-center justify-center transition-colors shrink-0 text-slate-600 ${geoLoading ? 'animate-spin' : ''}`}
                                title="Use current location"
                            >
                                <Compass className="w-5 h-5" />
                            </button>
                            <button
                                onClick={requestGPS}
                                className="bg-secondary hover:bg-secondaryLight text-white font-bold text-xs py-2 px-5 h-[40px] rounded-full transition-colors shrink-0 uppercase tracking-wider cursor-pointer"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Routing directions HUD */}
                    {routeHUD && (
                        <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 space-y-1 animate-fade-in max-w-xs">
                            <div className="flex items-center space-x-2 text-primary">
                                <Navigation className="w-4 h-4 fill-current animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Route Active</span>
                            </div>
                            <p className="text-sm font-heading font-black text-white">
                                {routeHUD.distance} km • <span className="text-primary">{routeHUD.duration} mins away</span>
                            </p>
                        </div>
                    )}

                    {/* Map component */}
                    <MapComponent
                        labours={filteredLabourers}
                        customerLoc={customerLoc}
                        selectedLabour={selectedLabour}
                        searchRadius={searchRadius}
                        onBook={handleOpenBook}
                    />

                    {/* Floating Action Buttons */}
                    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col space-y-3">
                        <button
                            onClick={requestGPS}
                            className="w-12 h-12 bg-white rounded-full border border-slate-200 shadow-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                            title="My Location"
                        >
                            <MapPin className="w-5 h-5 text-primary" />
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="w-12 h-12 bg-white rounded-full border border-slate-200 shadow-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                            title="Reset Filters"
                        >
                            <RefreshCw className="w-5 h-5 text-slate-500" />
                        </button>
                        <button
                            onClick={handleScrollToTop}
                            className="w-12 h-12 bg-slate-900 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-slate-800 transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                            title="Scroll to Top"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Worker Details Drawer */}
                    <AnimatePresence>
                        {selectedLabour && (
                            <>
                                <div 
                                    className="fixed inset-0 bg-black/35 z-[1000] md:hidden"
                                    onClick={() => setSelectedLabour(null)}
                                />

                                <motion.div
                                    initial={window.innerWidth >= 768 ? { x: '100%' } : { y: '100%' }}
                                    animate={window.innerWidth >= 768 ? { x: 0 } : { y: 0 }}
                                    exit={window.innerWidth >= 768 ? { x: '100%' } : { y: '100%' }}
                                    transition={{ type: 'spring', damping: 26, stiffness: 210 }}
                                    className="fixed md:absolute bottom-0 md:top-0 right-0 h-[420px] md:h-full w-full md:w-[400px] bg-white shadow-2xl z-[1001] md:border-l border-slate-200/80 p-6 flex flex-col rounded-t-3xl md:rounded-none overflow-y-auto animate-fade-in"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-heading font-black text-slate-900 text-lg">Worker Details</h3>
                                        <button 
                                            onClick={() => setSelectedLabour(null)}
                                            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-200/50 shadow-sm text-slate-400 hover:text-slate-800 transition-colors"
                                        >
                                            <X className="w-4.5 h-4.5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={getAvatarUrl(selectedLabour.username)}
                                                    alt={selectedLabour.username}
                                                    onClick={() => handleOpenProfile(selectedLabour)}
                                                    className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-150 cursor-pointer"
                                                />
                                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                                            </div>
                                            <div>
                                                <h4 className="font-heading font-black text-slate-900 text-base flex items-center gap-1.5">
                                                    <span>{selectedLabour.username}</span>
                                                    <ShieldCheck className="w-4.5 h-4.5 text-green-500 shrink-0" />
                                                </h4>
                                                <p className="text-primary font-bold text-xs tracking-wider uppercase">
                                                    {selectedLabour.profession}
                                                </p>
                                                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                                                    <div className="flex items-center text-amber-500">
                                                        <Star className="w-3.5 h-3.5 fill-current" />
                                                        <span className="font-black ml-0.5">{selectedLabour.rating || 4.8}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>{selectedLabour.experience || selectedLabour.exp || 5} Years Exp</span>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-slate-100" />

                                        {/* Stats Panel */}
                                        <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600">
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jobs Finished</p>
                                                <p className="text-slate-800 text-sm font-extrabold mt-0.5">325 Completed</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Languages</p>
                                                <p className="text-slate-800 text-sm font-extrabold mt-0.5 truncate">Hindi, Punjabi</p>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bio Profile</p>
                                            <p className="text-slate-600 text-sm leading-relaxed truncate-3-lines">
                                                {selectedLabour.bio || `Skilled and highly reliable ${selectedLabour.profession} specialized in maintenance, emergency fixes, and residential setups. Known for clean, on-time operations.`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action footer */}
                                    <div className="border-t border-slate-100 pt-5 space-y-4 bg-white shrink-0 mt-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Visit Price</p>
                                                <p className="text-2xl font-heading font-black text-slate-900 mt-1">
                                                    ₹{selectedLabour.rate}<span className="text-sm font-normal text-slate-500">/hr</span>
                                                </p>
                                            </div>
                                            
                                            {selectedLabour.matchPercentage && (
                                                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-black py-1 px-3 rounded-full uppercase">
                                                    {selectedLabour.matchPercentage}% Match
                                                </span>
                                            )}
                                        </div>

                                        {/* Buttons */}
                                        <div className="grid grid-cols-3 gap-2.5">
                                            <a
                                                href={`tel:${selectedLabour.phone || '9876543210'}`}
                                                className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200/50 transition-colors flex items-center justify-center space-x-1.5 text-xs"
                                            >
                                                <Phone className="w-4 h-4 text-slate-600" />
                                                <span>Call</span>
                                            </a>
                                            <button
                                                onClick={() => handleOpenChat(selectedLabour)}
                                                className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200/50 transition-colors flex items-center justify-center space-x-1.5 text-xs"
                                            >
                                                <MessageSquare className="w-4 h-4 text-slate-600" />
                                                <span>Chat</span>
                                            </button>
                                            <button
                                                onClick={() => handleOpenBook(selectedLabour)}
                                                className="py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
                                            >
                                                <span>Book Now</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                labour={bookingLabour}
            />

            <WorkerProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                labour={profileLabour}
                onBook={handleOpenBook}
            />

            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipient={chatRecipient}
            />
        </div>
    );
};

export default FindLabour;
