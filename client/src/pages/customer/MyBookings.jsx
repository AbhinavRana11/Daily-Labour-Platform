import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin, MessageSquare, Phone, Calendar, Clock, X,
    CheckCircle, AlertCircle, Package, Search, Filter,
    ChevronDown, Navigation2, Briefcase, Star, ShieldCheck,
    ArrowRight, Users, Zap, RefreshCw, SlidersHorizontal,
    TrendingUp, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from '../../components/ChatModal';
import RatingModal from '../../components/RatingModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getAvatarUrl = (username = '') => {
    const avatars = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
    ];
    const idx = Math.abs(username.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % avatars.length;
    return avatars[idx];
};

const STATUS_CONFIG = {
    pending:         { label: 'Pending',      color: '#F59E0B', bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  text: 'text-amber-400',  progress: 10 },
    accepted:        { label: 'Accepted',     color: '#3B82F6', bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   text: 'text-blue-400',   progress: 30 },
    on_the_way:      { label: 'On the Way',   color: '#8B5CF6', bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400', progress: 55 },
    arrived:         { label: 'Arrived',      color: '#F97316', bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-400', progress: 70 },
    reached_arrived: { label: 'Arrived',      color: '#F97316', bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-400', progress: 70 },
    working:         { label: 'Working',      color: '#06B6D4', bg: 'bg-cyan-500/10',   border: 'border-cyan-500/25',   text: 'text-cyan-400',   progress: 85 },
    started:         { label: 'Working',      color: '#06B6D4', bg: 'bg-cyan-500/10',   border: 'border-cyan-500/25',   text: 'text-cyan-400',   progress: 85 },
    completed:       { label: 'Completed',    color: '#22C55E', bg: 'bg-green-500/10',  border: 'border-green-500/25',  text: 'text-green-400',  progress: 100 },
    cancelled:       { label: 'Cancelled',    color: '#EF4444', bg: 'bg-red-500/10',    border: 'border-red-500/25',    text: 'text-red-400',    progress: 0 },
    rejected:        { label: 'Rejected',     color: '#EF4444', bg: 'bg-red-500/10',    border: 'border-red-500/25',    text: 'text-red-400',    progress: 0 },
};

const TIMELINE_STEPS = [
    { key: 'pending',    icon: '📋', label: 'Requested' },
    { key: 'accepted',   icon: '✅', label: 'Accepted'  },
    { key: 'on_the_way', icon: '🚗', label: 'On the Way'},
    { key: 'arrived',    icon: '📍', label: 'Arrived'   },
    { key: 'working',    icon: '🛠️', label: 'Working'   },
    { key: 'completed',  icon: '🏁', label: 'Done'      },
];

const getStepIndex = (status) => {
    const map = { pending: 0, accepted: 1, on_the_way: 2, arrived: 3, reached_arrived: 3, working: 4, started: 4, completed: 5 };
    return map[status] ?? 0;
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedCounter = ({ target }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        let start = 0;
        const step = Math.ceil(target / 20);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
        }, 40);
        return () => clearInterval(timer);
    }, [target]);
    return <span>{count}</span>;
};

// ─── Progress Ring ────────────────────────────────────────────────────────────
const ProgressRing = ({ progress, color, size = 44 }) => {
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (progress / 100) * circ;
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={5} />
            <circle
                cx={size/2} cy={size/2} r={r} fill="none"
                stroke={color} strokeWidth={5}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
        </svg>
    );
};

// ─── Booking Details Drawer ────────────────────────────────────────────────────
const DetailsDrawer = ({ booking, onClose }) => {
    if (!booking) return null;
    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
    return (
        <AnimatePresence>
            {booking && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F172A] border-l border-slate-800 z-50 overflow-y-auto shadow-2xl"
                    >
                        {/* Drawer Header */}
                        <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-black text-lg">Booking Details</h3>
                                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                                    {booking.bookingId || `#BK${booking._id.slice(-6).toUpperCase()}`}
                                </p>
                            </div>
                            <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Status badge */}
                            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                                <span className="text-xl">
                                    {booking.status === 'completed' ? '✅' : booking.status === 'cancelled' ? '❌' : '🔄'}
                                </span>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Status</p>
                                    <p className={`font-black text-sm ${cfg.text}`}>{cfg.label}</p>
                                </div>
                            </div>

                            {/* Worker */}
                            {booking.labour && (
                                <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-4 space-y-3">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Worker</p>
                                    <div className="flex items-center gap-3">
                                        <img src={getAvatarUrl(booking.labour.username)} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                        <div>
                                            <p className="text-white font-black">{booking.labour.username}</p>
                                            <p className="text-primary text-xs font-bold uppercase">{booking.labour.profession}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
                                            <p className="text-slate-500 font-bold uppercase text-[9px]">Rating</p>
                                            <p className="text-amber-400 font-black mt-0.5">⭐ {booking.labour.rating || '4.9'}</p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
                                            <p className="text-slate-500 font-bold uppercase text-[9px]">Rate</p>
                                            <p className="text-white font-black mt-0.5">₹{booking.labour.rate}/hr</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Booking Info */}
                            <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-4 space-y-3">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Booking Info</p>
                                {[
                                    { icon: '📅', label: 'Date', val: new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) },
                                    { icon: '🕐', label: 'Time', val: booking.scheduledTime || '09:00 AM' },
                                    { icon: '📍', label: 'Address', val: booking.address || booking.customerAddress || 'Your saved address' },
                                    { icon: '🔧', label: 'Service', val: booking.service || booking.labour?.profession },
                                    { icon: '💰', label: 'Amount', val: `₹${booking.totalPrice}` },
                                    { icon: '💳', label: 'Payment', val: booking.paymentStatus || 'Pending' },
                                    { icon: '📝', label: 'Notes', val: booking.notes || '—' },
                                ].map(({ icon, label, val }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p>
                                            <p className="text-white text-sm font-semibold mt-0.5">{val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ─── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ item, onOpenChat, onOpenReview, onCancel, onOpenDetails }) => {
    const navigate = useNavigate();
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const avatar = getAvatarUrl(item.labour?.username || 'Worker');
    const stepIdx = getStepIndex(item.status);
    const isActive = ['on_the_way', 'arrived', 'working', 'started', 'reached_arrived'].includes(item.status);
    const isTrackable = !['cancelled', 'rejected', 'completed'].includes(item.status);
    const isCancellable = ['pending', 'accepted'].includes(item.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, boxShadow: '0 20px 60px rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }}
            transition={{ duration: 0.2 }}
            className="bg-[#1E293B] border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-200"
        >
            {/* Status Banner for active */}
            {isActive && (
                <div className="px-5 py-3 flex items-center gap-3" style={{ background: `linear-gradient(90deg, ${cfg.color}18, transparent)`, borderBottom: `1px solid ${cfg.color}30` }}>
                    <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: cfg.color }} />
                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: cfg.color }}>
                        {item.status === 'on_the_way' ? '🚗 Worker is on the way — ETA ~12 min' :
                         item.status === 'arrived' || item.status === 'reached_arrived' ? '📍 Worker has arrived at your location' :
                         item.status === 'working' || item.status === 'started' ? '🛠️ Work is in progress right now' : cfg.label}
                    </p>
                </div>
            )}

            <div className="p-5 space-y-5">
                {/* ── Worker Info Row ── */}
                <div className="flex gap-4 items-start">
                    <div className="relative flex-shrink-0">
                        <img src={avatar} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700/50" />
                        {isActive && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#1E293B] rounded-full" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-white font-black text-[18px] leading-tight">
                                        {item.labour?.username || 'Worker'}
                                    </h3>
                                    <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                </div>
                                <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">
                                    {item.labour?.profession || 'Handyman'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(item.labour?.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                                        ))}
                                    </div>
                                    <span className="text-amber-400 text-[11px] font-bold">{item.labour?.rating || '4.9'}</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-slate-400 text-[11px] font-semibold">₹{item.labour?.rate}/hr</span>
                                </div>
                            </div>

                            {/* Progress ring */}
                            <div className="relative flex-shrink-0 flex flex-col items-center">
                                <ProgressRing progress={cfg.progress} color={cfg.color} size={44} />
                                <p className="text-[9px] font-black uppercase text-slate-500 mt-1 tracking-wider">{cfg.progress}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Booking Meta ── */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/60 rounded-xl p-2.5 text-center border border-slate-800/60">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Date</p>
                        <p className="text-white font-black text-xs mt-1">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl p-2.5 text-center border border-slate-800/60">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Time</p>
                        <p className="text-white font-black text-xs mt-1">{item.scheduledTime || '9:00 AM'}</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl p-2.5 text-center border border-slate-800/60">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Amount</p>
                        <p className="text-white font-black text-xs mt-1">₹{item.totalPrice}</p>
                    </div>
                </div>

                {/* Booking ID + Status */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full">
                        {item.bookingId || `#BK${item._id.slice(-6).toUpperCase()}`}
                    </span>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                        {cfg.label}
                    </span>
                </div>

                {/* ETA card for active */}
                {isActive && (
                    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-blue-500/10">🚗</div>
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated Arrival</p>
                            <p className="text-white font-black text-sm mt-0.5">12 Minutes away • 2.3 km</p>
                        </div>
                        <Link
                            to={`/customer/track/${item._id}`}
                            className="text-[10px] font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                        >
                            Live <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                )}

                {/* ── Timeline ── */}
                {!['cancelled', 'rejected'].includes(item.status) && (
                    <div className="relative py-2">
                        <div className="flex items-center justify-between relative">
                            {/* Track line */}
                            <div className="absolute left-3 right-3 h-0.5 bg-slate-800 top-3.5 z-0" />
                            <div
                                className="absolute left-3 h-0.5 top-3.5 z-0 transition-all duration-700 rounded-full"
                                style={{ width: `calc(${(stepIdx / (TIMELINE_STEPS.length - 1)) * 100}% - 6px)`, background: cfg.color }}
                            />
                            {TIMELINE_STEPS.map((step, i) => {
                                const done = stepIdx > i;
                                const active = stepIdx === i;
                                return (
                                    <div key={step.key} className="flex flex-col items-center z-10 gap-1">
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-300"
                                            style={{
                                                background: done ? cfg.color : active ? `${cfg.color}20` : '#0F172A',
                                                borderColor: done || active ? cfg.color : '#334155',
                                                transform: active ? 'scale(1.2)' : 'scale(1)',
                                                boxShadow: active ? `0 0 14px ${cfg.color}60` : 'none',
                                            }}
                                        >
                                            {done ? '✓' : <span style={{ fontSize: '11px' }}>{step.icon}</span>}
                                        </div>
                                        <span
                                            className="text-[8px] font-black uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: done || active ? cfg.color : '#475569' }}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Action Buttons ── */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onOpenDetails(item)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded-xl border border-slate-700/50 transition-colors cursor-pointer"
                    >
                        <Briefcase className="w-3 h-3" /> Details
                    </button>

                    {isTrackable && (
                        <Link
                            to={`/customer/track/${item._id}`}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-xl shadow-md shadow-blue-500/20 transition-colors"
                        >
                            <MapPin className="w-3 h-3" /> Track
                        </Link>
                    )}

                    {item.labour && (
                        <>
                            <button
                                onClick={() => onOpenChat(item.labour, item)}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded-xl border border-slate-700/50 transition-colors cursor-pointer"
                            >
                                <MessageSquare className="w-3 h-3" /> Chat
                            </button>
                            <a
                                href={`tel:${item.labour.phone || ''}`}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-[10px] font-black uppercase rounded-xl border border-green-600/25 transition-colors"
                            >
                                <Phone className="w-3 h-3" /> Call
                            </a>
                        </>
                    )}

                    {item.status === 'completed' && (
                        <button
                            onClick={() => onOpenReview(item)}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[10px] font-black uppercase rounded-xl border border-amber-500/25 transition-colors cursor-pointer"
                        >
                            <Star className="w-3 h-3" /> Rate
                        </button>
                    )}

                    {isCancellable && (
                        <button
                            onClick={() => onCancel(item._id)}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-xl border border-red-500/20 transition-colors cursor-pointer"
                        >
                            <XCircle className="w-3 h-3" /> Cancel
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ tab, navigate }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-4xl">
            {tab === 'completed' ? '✅' : tab === 'cancelled' ? '❌' : '📦'}
        </div>
        <div>
            <h3 className="text-white font-black text-xl">No {tab} bookings</h3>
            <p className="text-slate-500 text-sm mt-1">Find trusted workers nearby and book a service</p>
        </div>
        <button
            onClick={() => navigate('/customer/find')}
            className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
        >
            <Search className="w-4 h-4" /> Book Now
        </button>
    </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const MyBookings = () => {
    const { user, socket } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [detailsBooking, setDetailsBooking] = useState(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState(null);
    const [chatBooking, setChatBooking] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
            } catch (err) {
                console.error('Failed to load bookings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();

        if (socket) {
            socket.on('booking_status_update', (updated) => {
                setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
            });
            return () => socket.off('booking_status_update');
        }
    }, [user, socket, navigate]);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/bookings/${id}`, { status: 'cancelled' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b => b._id === id ? res.data : b));
        } catch { alert('Failed to cancel.'); }
    };

    // ── Stats ──
    const stats = {
        total: bookings.length,
        active: bookings.filter(b => ['on_the_way', 'arrived', 'working', 'started', 'reached_arrived'].includes(b.status)).length,
        upcoming: bookings.filter(b => ['pending', 'accepted'].includes(b.status)).length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => ['cancelled', 'rejected'].includes(b.status)).length,
    };

    // ── Filter + Sort ──
    const tabFilter = (b) => {
        if (activeTab === 'active')    return ['on_the_way', 'arrived', 'working', 'started', 'reached_arrived'].includes(b.status);
        if (activeTab === 'upcoming')  return ['pending', 'accepted'].includes(b.status);
        if (activeTab === 'completed') return b.status === 'completed';
        if (activeTab === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
        return true;
    };

    const filtered = bookings
        .filter(tabFilter)
        .filter(b => {
            const q = searchQuery.toLowerCase();
            if (!q) return true;
            return (
                (b.bookingId || '').toLowerCase().includes(q) ||
                (b._id || '').toLowerCase().includes(q) ||
                (b.labour?.username || '').toLowerCase().includes(q) ||
                (b.labour?.profession || '').toLowerCase().includes(q) ||
                (b.service || '').toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'newest')   return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest')   return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'highest')  return (b.totalPrice || 0) - (a.totalPrice || 0);
            if (sortBy === 'nearest')  return new Date(a.date) - new Date(b.date);
            return 0;
        });

    const TABS = [
        { key: 'active',    label: 'Active',     count: stats.active,    color: '#22C55E', icon: '🟢' },
        { key: 'upcoming',  label: 'Upcoming',   count: stats.upcoming,  color: '#F59E0B', icon: '🟡' },
        { key: 'completed', label: 'Completed',  count: stats.completed, color: '#3B82F6', icon: '✅' },
        { key: 'cancelled', label: 'Cancelled',  count: stats.cancelled, color: '#EF4444', icon: '❌' },
    ];

    return (
        <div className="min-h-screen font-sans" style={{ background: '#0F172A', color: '#fff' }}>

            {/* ── Hero Banner ─────────────────────────────── */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 40%, #0F172A 100%)', minHeight: '220px', borderRadius: '0 0 2rem 2rem' }}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-black/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <p className="text-white/70 font-semibold text-sm mb-1">👋 Welcome back,</p>
                        <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                            {user?.username || 'User'}
                        </h1>
                        <p className="text-white/60 text-sm mt-2 font-medium max-w-xs">
                            Manage your bookings, track workers, and stay updated in real time.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/customer/find')}
                        className="flex items-center gap-2 bg-white text-orange-600 font-black text-sm px-6 py-3 rounded-2xl shadow-2xl hover:shadow-orange-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95 flex-shrink-0"
                    >
                        <Zap className="w-4 h-4" /> Book New Service
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-7">

                {/* ── Stats Row ───────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Bookings', value: stats.total,     icon: '📦', color: '#3B82F6' },
                        { label: 'Active',          value: stats.active,    icon: '🟢', color: '#22C55E' },
                        { label: 'Completed',       value: stats.completed, icon: '✅', color: '#10B981' },
                        { label: 'Cancelled',       value: stats.cancelled, icon: '❌', color: '#EF4444' },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className="bg-[#1E293B] border border-slate-700/40 rounded-2xl p-4 text-center hover:border-slate-600/60 transition-colors">
                            <span className="text-2xl">{icon}</span>
                            <p className="text-2xl font-black text-white mt-2">
                                {loading ? '—' : <AnimatedCounter target={value} />}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ────────────────────────────────── */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {TABS.map(({ key, label, count, color, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex-shrink-0 border ${
                                activeTab === key
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-orange-500/20'
                                    : 'bg-[#1E293B] text-slate-400 border-slate-700/40 hover:text-white hover:border-slate-600'
                            }`}
                        >
                            <span>{icon}</span>
                            {label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === key ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                {count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Search + Filter ─────────────────────── */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by ID, worker name or service..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1E293B] border border-slate-700/50 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(f => !f)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-bold transition-colors cursor-pointer ${showFilters ? 'bg-primary border-primary text-white' : 'bg-[#1E293B] border-slate-700/50 text-slate-400 hover:text-white'}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Sort</span>
                        </button>
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    className="absolute right-0 top-14 bg-[#1E293B] border border-slate-700/60 rounded-2xl shadow-2xl z-20 min-w-[160px] overflow-hidden"
                                >
                                    {[
                                        { key: 'newest',  label: 'Newest First' },
                                        { key: 'oldest',  label: 'Oldest First' },
                                        { key: 'highest', label: 'Highest Price' },
                                        { key: 'nearest', label: 'Nearest Date'  },
                                    ].map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => { setSortBy(key); setShowFilters(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${sortBy === key ? 'text-primary bg-primary/10' : 'text-slate-300 hover:bg-slate-800'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Booking List ─────────────────────────── */}
                <div className="space-y-5">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 py-16">
                            <div className="w-10 h-10 border-4 border-slate-700 border-t-primary rounded-full animate-spin" />
                            <p className="text-slate-500 text-sm font-semibold">Loading bookings...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        filtered.map(item => (
                            <BookingCard
                                key={item._id}
                                item={item}
                                onOpenChat={(r, b) => { setChatRecipient(r); setChatBooking(b); setIsChatOpen(true); }}
                                onOpenReview={(b) => { setReviewBooking(b); setIsReviewOpen(true); }}
                                onCancel={handleCancel}
                                onOpenDetails={(b) => setDetailsBooking(b)}
                            />
                        ))
                    ) : (
                        <EmptyState tab={activeTab} navigate={navigate} />
                    )}
                </div>

                {/* ── Bottom CTA ───────────────────────────── */}
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-white font-black text-lg">Need another service?</h3>
                        <p className="text-slate-400 text-sm mt-0.5">Browse 500+ skilled workers near you</p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <button
                            onClick={() => navigate('/customer/find')}
                            className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-lg shadow-orange-500/20 text-sm"
                        >
                            <Zap className="w-4 h-4" /> Book Again
                        </button>
                        <button
                            onClick={() => navigate('/customer/find')}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer text-sm"
                        >
                            <Users className="w-4 h-4" /> Nearby Workers
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modals & Drawer ──────────────────────────── */}
            <DetailsDrawer booking={detailsBooking} onClose={() => setDetailsBooking(null)} />

            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipient={chatRecipient}
                booking={chatBooking}
            />

            <RatingModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                booking={reviewBooking}
                onReviewSubmitted={() => { setIsReviewOpen(false); window.location.reload(); }}
            />
        </div>
    );
};

export default MyBookings;
