import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    MessageSquare, X, Send, Sparkles, Navigation, Phone, 
    Calculator, Star, MapPin, ShieldCheck, Zap, Calendar, HeartHandshake 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// AI Ranking Formula Score calculator
// 40% Distance, 30% Rating, 15% Experience, 10% Response Time, 5% Price
const calculateAIScore = (worker, customerLoc) => {
    // 1. Distance score (normalized 1 to 10 km)
    let distance = 5;
    if (customerLoc && worker.location?.coordinates) {
        const [lng, lat] = worker.location.coordinates;
        // Haversine distance
        const R = 6371; 
        const dLat = (lat - customerLoc.lat) * Math.PI / 180;
        const dLon = (lng - customerLoc.lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(customerLoc.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = R * c;
    }
    const distScore = Math.max(0, (10 - distance) / 10) * 100; // closer = higher

    // 2. Rating score (normalized 1 to 5 stars)
    const ratingScore = ((worker.rating || 4.5) / 5) * 100;

    // 3. Experience score (normalized 1 to 15 years)
    const exp = worker.experience || worker.exp || 3;
    const expScore = Math.min(100, (exp / 15) * 100);

    // 4. Response Time score (normalized 5 to 60 mins)
    const respTime = worker.responseTime ? parseInt(worker.responseTime) : 15;
    const respScore = Math.max(0, (60 - respTime) / 55) * 100;

    // 5. Price score (normalized ₹200 to ₹1000)
    const rate = worker.rate || 300;
    const priceScore = Math.max(0, (1000 - rate) / 800) * 100; // cheaper = higher

    // Apply weights
    const totalScore = (distScore * 0.40) + (ratingScore * 0.30) + (expScore * 0.15) + (respScore * 0.10) + (priceScore * 0.05);
    return {
        score: Math.round(totalScore),
        distance: distance.toFixed(1),
        matchReasons: distScore > 75 ? ["Very Close"] : (worker.rating >= 4.7 ? ["Highly Rated"] : ["Budget Friendly"])
    };
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

const AIAssistant = ({ labours = [], onBook, onFilterCategory, onHighlightWorker }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [inputText, setInputText] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    
    // Active booking tracking
    const [activeBooking, setActiveBooking] = useState(null);

    // Price estimator state machine flow
    const [estimatorState, setEstimatorState] = useState(null); // 'service', 'rooms', null
    const [estimatorData, setEstimatorData] = useState({ service: '', rooms: '' });

    const chatEndRef = useRef(null);
    const customerLoc = { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates

    // Scroll to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory]);

    // Check for active bookings
    useEffect(() => {
        const fetchActiveBooking = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Find active bookings in progress
                const active = res.data.find(b => ['accepted', 'on_the_way', 'arrived', 'working', 'started'].includes(b.status));
                setActiveBooking(active || null);
            } catch (err) {
                console.error("Failed to check active bookings for AI:", err);
            }
        };

        fetchActiveBooking();
        const interval = setInterval(fetchActiveBooking, 10000);
        return () => clearInterval(interval);
    }, [user]);

    // Initialize greeting on open
    const handleOpen = () => {
        setIsOpen(true);
        setHasUnread(false);

        if (chatHistory.length === 0) {
            const plumbers = labours.filter(l => l.profession?.toLowerCase() === 'plumber').length;
            const electricians = labours.filter(l => l.profession?.toLowerCase() === 'electrician').length;

            const initialGreeting = activeBooking 
                ? `Worker ${activeBooking.labour?.username || 'Rahul'} has accepted your booking and is currently ${activeBooking.status.replace(/_/g, ' ')}. Would you like to track them or open chat?`
                : `Good Afternoon ${user?.username || 'Abhi'} 👋 Based on your location, I found: ${electricians || 3} Electricians, ${plumbers || 2} Plumbers near you. Nearest worker arrives in 9 minutes.`;

            setChatHistory([
                { sender: 'ai', text: initialGreeting }
            ]);
        }
    };

    const addMessage = (sender, text, action = null) => {
        setChatHistory(prev => [...prev, { sender, text, action }]);
    };

    // Standard Quick Actions Parser
    const handleQuickAction = (actionKey) => {
        addMessage('user', actionKey.replace(/_/g, ' '));

        setTimeout(() => {
            if (actionKey === '⚡ Need Worker Now') {
                const available = labours.filter(l => l.isAvailable);
                if (available.length > 0) {
                    const nearest = available[0];
                    const meta = calculateAIScore(nearest, customerLoc);
                    addMessage('ai', `Found ${available.length} available handymen online. Nearest: ${nearest.username} (${nearest.profession}) is ${meta.distance} km away. ETA 8 min.`, nearest);
                } else {
                    addMessage('ai', "No available handymen are online right now. Try expanding your search radius!");
                }
            }
            else if (actionKey === '⭐ Best Worker Near Me') {
                if (labours.length === 0) {
                    addMessage('ai', "No workers found in your current location radius.");
                    return;
                }
                const scoredList = labours.map(w => ({
                    ...w,
                    ...calculateAIScore(w, customerLoc)
                })).sort((a, b) => b.score - a.score);

                const best = scoredList[0];
                addMessage('ai', `Best Match Recommendation: ${best.username} | Rating: ⭐ ${best.rating} | Rate: ₹${best.rate}/hr | ${best.score}% Match Score.`, best);
            }
            else if (actionKey === '💰 Estimate Service Cost') {
                setEstimatorState('service');
                addMessage('ai', "Which service do you need? (e.g. Painting, Plumbing, Electrician)");
            }
            else if (actionKey === '📍 Find Nearby Workers') {
                if (onFilterCategory) onFilterCategory('All');
                addMessage('ai', "Map zoomed. Highlighted all active daily workers nearby.");
            }
            else if (actionKey === '🛠 Which Worker Do I Need?') {
                addMessage('ai', "Please describe your issue (e.g. 'fan is not working', 'leaky kitchen sink faucet') and I will identify the correct specialist.");
            }
            else if (actionKey === '🚨 Emergency Labour') {
                const online = labours.filter(l => l.isAvailable);
                if (online.length > 0) {
                    const nearest = online[0];
                    const meta = calculateAIScore(nearest, customerLoc);
                    addMessage('ai', `Emergency response triggered! Nearest specialist ${nearest.username} is ${meta.distance} km away. Estimated arrival: 6 minutes.`, nearest);
                } else {
                    addMessage('ai', "No emergency workers are active in your area. Contact support directly.");
                }
            }
            else if (actionKey === '📅 Schedule a Booking') {
                addMessage('ai', "Let's set up a scheduled appointment. Please choose a category from the chips to view workers, then click Book.");
            }
            else if (actionKey === '📞 Contact Support') {
                addMessage('ai', "For 24/7 hotline support, call us at 1800-123-4567 or email support@dailylabour.com.");
            }
        }, 800);
    };

    // Text query processing parser
    const handleSendText = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const text = inputText.trim();
        addMessage('user', text);
        setInputText('');

        setTimeout(() => {
            const query = text.toLowerCase();

            // Cost estimator conversational flow check
            if (estimatorState === 'service') {
                setEstimatorData(prev => ({ ...prev, service: text }));
                setEstimatorState('rooms');
                addMessage('ai', "How many rooms or repair spots are involved? (e.g. 1 Room, 2 Rooms, Whole House)");
                return;
            }
            if (estimatorState === 'rooms') {
                const service = estimatorData.service.toLowerCase();
                let base = 400;
                if (service.includes('paint')) base = 1800;
                else if (service.includes('mason')) base = 1200;

                let multiplier = 1.0;
                if (query.includes('2') || query.includes('two')) multiplier = 1.8;
                else if (query.includes('whole') || query.includes('full')) multiplier = 3.5;

                const price = Math.round(base * multiplier);
                addMessage('ai', `Estimated Cost range for ${estimatorData.service} (${text}): ₹${Math.round(price * 0.9)} - ₹${Math.round(price * 1.1)}.`);
                setEstimatorState(null);
                setEstimatorData({ service: '', rooms: '' });
                return;
            }

            // Natural language triggers
            if (query.includes('cheapest plumber') || query.includes('plumber below')) {
                const plumbers = labours.filter(l => l.profession?.toLowerCase() === 'plumber').sort((a,b) => a.rate - b.rate);
                if (plumbers.length > 0) {
                    addMessage('ai', `Found cheapest plumber: ${plumbers[0].username} charging only ₹${plumbers[0].rate}/hr.`, plumbers[0]);
                } else {
                    addMessage('ai', "No plumbers found currently online.");
                }
            }
            else if (query.includes('below') || query.includes('under')) {
                // Parse rate number
                const match = query.match(/\d+/);
                const limit = match ? parseInt(match[0]) : 300;
                const cheap = labours.filter(l => l.rate <= limit);
                if (cheap.length > 0) {
                    addMessage('ai', `Found ${cheap.length} workers below ₹${limit}/hr. Nearest match: ${cheap[0].username} (₹${cheap[0].rate}/hr)`, cheap[0]);
                } else {
                    addMessage('ai', `No workers found charging below ₹${limit}/hr.`);
                }
            }
            else if (query.includes('highest-rated') || query.includes('best painter') || query.includes('highest rated')) {
                const profession = query.includes('painter') ? 'painter' : (query.includes('plumber') ? 'plumber' : 'electrician');
                const sorted = labours.filter(l => l.profession?.toLowerCase() === profession).sort((a,b) => (b.rating || 0) - (a.rating || 0));
                if (sorted.length > 0) {
                    addMessage('ai', `Highest Rated ${profession}: ${sorted[0].username} with ⭐ ${sorted[0].rating || 4.9} rating.`, sorted[0]);
                } else {
                    addMessage('ai', `Could not find rated workers in category: ${profession}`);
                }
            }
            else if (query.includes('fan') || query.includes('light') || query.includes('wire') || query.includes('power')) {
                const electricians = labours.filter(l => l.profession?.toLowerCase() === 'electrician');
                if (onFilterCategory) onFilterCategory('Electrician');
                addMessage('ai', `Fan/electrical issue identified. You need an Electrician. Found ${electricians.length} available electricians near you.`, electricians[0]);
            }
            else if (query.includes('sink') || query.includes('leak') || query.includes('pipe') || query.includes('faucet')) {
                const plumbers = labours.filter(l => l.profession?.toLowerCase() === 'plumber');
                if (onFilterCategory) onFilterCategory('Plumber');
                addMessage('ai', `Leaky sink/plumbing issue identified. You need a Plumber. Found ${plumbers.length} available plumbers.`, plumbers[0]);
            }
            else if (query.includes('recommend') || query.includes('which worker') || query.includes('best worker')) {
                handleQuickAction('⭐ Best Worker Near Me');
            }
            else if (query.includes('estimate') || query.includes('cost') || query.includes('price')) {
                handleQuickAction('💰 Estimate Service Cost');
            }
            else if (query.includes('compare')) {
                if (labours.length >= 2) {
                    const w1 = labours[0];
                    const w2 = labours[1];
                    addMessage('ai', `Comparison:\n1. ${w1.username}: ₹${w1.rate}/hr, Rating: ⭐ ${w1.rating || 4.8}, Exp: ${w1.experience || 5} yrs\n2. ${w2.username}: ₹${w2.rate}/hr, Rating: ⭐ ${w2.rating || 4.7}, Exp: ${w2.experience || 4} yrs.`);
                } else {
                    addMessage('ai', "Need at least 2 workers online to run comparisons.");
                }
            }
            else {
                addMessage('ai', "I understand. Try using one of our Quick Action buttons above to search available workers instantly.");
            }
        }, 800);
    };

    return (
        <div className="font-sans">
            
            {/* Collapsed floating button with unread dot */}
            <div className="fixed bottom-6 right-6 z-[1001] flex flex-col items-end">
                <button
                    onClick={isOpen ? () => setIsOpen(false) : handleOpen}
                    className="h-14 bg-gradient-to-r from-primary to-orange-500 hover:from-primaryDark hover:to-orange-600 text-white rounded-full px-5 shadow-2xl flex items-center space-x-2.5 relative overflow-hidden transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer border border-orange-400/20 group"
                >
                    <span className="relative flex h-3.5 w-3.5 shrink-0">
                        {hasUnread && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        )}
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white items-center justify-center text-[10px] text-primary">🤖</span>
                    </span>
                    
                    <span className="text-xs font-heading font-black tracking-wider uppercase hidden sm:inline-block">
                        {isOpen ? "Close Assistant" : "Ask DailyLabour AI"}
                    </span>
                </button>
            </div>

            {/* Expanding chat drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* backdrop */}
                        <div 
                            className="fixed inset-0 bg-slate-950/40 z-[1002] transition-opacity"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* drawer panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-slate-900 border-l border-slate-800/80 shadow-2xl z-[1003] flex flex-col overflow-hidden text-white"
                        >
                            
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                                <div className="flex items-center space-x-2.5">
                                    <span className="text-2xl">🤖</span>
                                    <div>
                                        <h3 className="font-heading font-black text-white text-base">DailyLabour AI</h3>
                                        <span className="flex items-center text-[10px] text-green-400 font-bold uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-ping"></span>
                                            Online & Ready
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Chat history logs */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                                {chatHistory.map((msg, index) => (
                                    <div 
                                        key={index}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                                            msg.sender === 'user'
                                                ? 'bg-primary text-white font-semibold rounded-tr-none'
                                                : 'bg-slate-800 border border-slate-750 text-slate-200 rounded-tl-none'
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                            
                                            {/* Action recommendation card attachment */}
                                            {msg.action && (
                                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <img src={getAvatarUrl(msg.action.username)} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-850" />
                                                        <div>
                                                            <h5 className="font-bold text-white text-xs">{msg.action.username}</h5>
                                                            <p className="text-[10px] text-primary uppercase font-bold tracking-wider">{msg.action.profession}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                                                        <span>Rate: ₹{msg.action.rate}/hr</span>
                                                        <span>⭐ {msg.action.rating || 4.8}</span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {onHighlightWorker && (
                                                            <button
                                                                onClick={() => {
                                                                    onHighlightWorker(msg.action);
                                                                    setIsOpen(false);
                                                                }}
                                                                className="py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider"
                                                            >
                                                                Find on Map
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                if (onBook) onBook(msg.action);
                                                            }}
                                                            className="py-1.5 bg-primary hover:bg-primaryDark text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow shadow-orange-500/10"
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Active booking post-booking card panel */}
                            {activeBooking && (
                                <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-3.5">
                                    <div className="flex items-center space-x-2 text-primary font-black text-[10px] uppercase tracking-widest leading-none">
                                        <Navigation className="w-4 h-4 fill-current animate-pulse" />
                                        <span>Active Booking Tracking</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img src={getAvatarUrl(activeBooking.labour?.username || 'Rahul')} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                                            <div>
                                                <h5 className="font-bold text-xs text-white leading-tight">{activeBooking.labour?.username}</h5>
                                                <p className="text-[9px] text-slate-400 mt-0.5">{activeBooking.status.replace(/_/g, ' ').toUpperCase()}</p>
                                            </div>
                                        </div>
                                        
                                        <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full uppercase">ETA ~12 Min</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => navigate(`/customer/track/${activeBooking._id}`)}
                                            className="py-2 bg-primary hover:bg-primaryDark text-white font-bold rounded-xl text-[10px] uppercase tracking-wider text-center"
                                        >
                                            Track Journey 📍
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onBook) navigate('/customer/messages');
                                            }}
                                            className="py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider text-center"
                                        >
                                            Chat with Worker
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Suggestion Chips */}
                            {!activeBooking && (
                                <div className="px-5 py-3 bg-slate-950/20 border-t border-slate-800/60 flex flex-wrap gap-2">
                                    {['Need Electrician', 'Need Plumber', 'House Cleaning', 'Painting', 'Furniture Repair'].map(chip => (
                                        <button
                                            key={chip}
                                            onClick={() => {
                                                setInputText(chip);
                                            }}
                                            className="px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-750 rounded-full text-[10px] font-bold text-slate-350 hover:text-white transition-all cursor-pointer"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Actions Panel */}
                            {!activeBooking && (
                                <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-850 overflow-x-auto scrollbar-none flex space-x-2 shrink-0">
                                    {[
                                        '⚡ Need Worker Now',
                                        '⭐ Best Worker Near Me',
                                        '💰 Estimate Service Cost',
                                        '📍 Find Nearby Workers',
                                        '🛠 Which Worker Do I Need?',
                                        '🚨 Emergency Labour',
                                        '📅 Schedule a Booking',
                                        '📞 Contact Support'
                                    ].map(act => (
                                        <button
                                            key={act}
                                            onClick={() => handleQuickAction(act)}
                                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                                        >
                                            {act}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Chat inputs */}
                            <form 
                                onSubmit={handleSendText}
                                className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2 shrink-0"
                            >
                                <input
                                    type="text"
                                    placeholder="Ask anything..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-semibold"
                                />
                                <button
                                    type="submit"
                                    className="p-2.5 bg-primary hover:bg-primaryDark text-white rounded-xl transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-orange-500/10"
                                >
                                    <Send className="w-4.5 h-4.5" />
                                </button>
                            </form>

                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIAssistant;
