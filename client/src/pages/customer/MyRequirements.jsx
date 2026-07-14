import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
    ArrowLeft, CheckCircle, Clock, XCircle, Star,
    Phone, MessageSquare, ChevronDown, ChevronUp,
    Zap, Package, Users, MapPin, RefreshCw, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from '../../components/ChatModal';

const SERVICE_EMOJIS = { Electrician:'⚡',Plumber:'🚰',Painter:'🎨',Carpenter:'🛠️',Mason:'🧱',Housekeeper:'🏠',Cleaner:'🧹',Gardener:'🌿',Mechanic:'🔧',Other:'👷' };

const STATUS_CONFIG = {
    open:            { label: 'Open — Waiting for offers', color: '#3B82F6', bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   icon: '🔵' },
    offers_received: { label: 'Offers Received!',          color: '#F59E0B', bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  icon: '📩' },
    confirmed:       { label: 'Worker Confirmed',          color: '#22C55E', bg: 'bg-green-500/10',  border: 'border-green-500/25',  icon: '✅' },
    cancelled:       { label: 'Cancelled',                 color: '#EF4444', bg: 'bg-red-500/10',    border: 'border-red-500/25',    icon: '❌' },
    completed:       { label: 'Completed',                 color: '#10B981', bg: 'bg-emerald-500/10',border: 'border-emerald-500/25',icon: '🏁' },
};

const getAvatarUrl = (name = '') => {
    const avatars = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100",
    ];
    const idx = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % avatars.length;
    return avatars[idx];
};

// ── Offer Card ─────────────────────────────────────────────────────────────────
const OfferCard = ({ offer, onAccept, onChat, onCall, requestStatus }) => {
    const w = offer.worker;
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                offer.status === 'accepted'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-slate-800/60 border-slate-700/40 hover:border-slate-600'
            }`}
        >
            <div className="relative flex-shrink-0">
                <img src={getAvatarUrl(w?.username)} alt="" className="w-12 h-12 rounded-xl object-cover" />
                {offer.status === 'accepted' && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px] text-white font-bold">✓</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-white font-black text-sm truncate">{w?.username || 'Worker'}</p>
                    {offer.status === 'accepted' && <span className="text-green-400 text-[10px] font-bold">SELECTED</span>}
                </div>
                <p className="text-primary text-[10px] font-bold uppercase">{w?.profession}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400 text-[11px] font-bold">⭐ {w?.rating || '4.9'}</span>
                    <span className="text-slate-600 text-[10px]">•</span>
                    <span className="text-slate-400 text-[11px]">{w?.experience || 3} yrs</span>
                    <span className="text-slate-600 text-[10px]">•</span>
                    <span className="text-slate-400 text-[11px]">{w?.completedJobs || 100} jobs</span>
                </div>
                {offer.message && (
                    <p className="text-slate-400 text-[11px] mt-1 italic truncate">"{offer.message}"</p>
                )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-center">
                    <p className="text-white font-black text-base">₹{offer.price}</p>
                    <p className="text-slate-500 text-[9px] font-bold">{offer.estimatedArrival}</p>
                </div>
                {requestStatus === 'offers_received' && offer.status === 'pending' && (
                    <button
                        onClick={() => onAccept(offer._id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase rounded-xl transition-colors cursor-pointer"
                    >
                        Accept ✓
                    </button>
                )}
                <div className="flex gap-1.5">
                    <button onClick={() => onChat(w)} className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-colors">
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                    </button>
                    <a href={`tel:${w?.phone || ''}`} className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/25 flex items-center justify-center hover:bg-green-500/20 transition-colors">
                        <Phone className="w-3 h-3 text-green-400" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

// ── Request Card ───────────────────────────────────────────────────────────────
const RequestCard = ({ req, onAcceptOffer, onCancel, onChat }) => {
    const [expanded, setExpanded] = useState(req.offers?.length > 0);
    const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.open;
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1E293B] border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl"
        >
            <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0 border border-slate-700/40">
                        {SERVICE_EMOJIS[req.service] || '👷'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-black text-base leading-tight truncate">{req.title}</h3>
                        <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">{req.service}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-semibold flex-wrap">
                            <span>📅 {req.date ? new Date(req.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : 'Flexible'}</span>
                            {req.time && <span>🕐 {req.time}</span>}
                            <span>💰 ₹{req.budgetMin}–₹{req.budgetMax}</span>
                            <span className="capitalize">⚡ {req.urgency}</span>
                        </div>
                    </div>
                    <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${cfg.bg} ${cfg.border}`} style={{ color: cfg.color }}>
                        {cfg.icon} {req.offersCount > 0 ? `${req.offersCount} offers` : cfg.label}
                    </div>
                </div>

                {req.description && (
                    <p className="text-slate-400 text-xs leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                        {req.description}
                    </p>
                )}

                {req.address && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        {req.address}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {req.status === 'confirmed' && req.autoBookingId && (
                        <button
                            onClick={() => navigate(`/customer/booking-details/${req.autoBookingId}`)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600/15 border border-green-600/30 text-green-400 font-bold text-xs uppercase rounded-xl cursor-pointer hover:bg-green-600/25 transition-colors"
                        >
                            <CheckCircle className="w-3.5 h-3.5" /> View Booking
                        </button>
                    )}
                    {req.offers?.length > 0 && (
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold text-xs uppercase rounded-xl cursor-pointer hover:bg-amber-500/20 transition-colors"
                        >
                            <Users className="w-3.5 h-3.5" />
                            {req.offers.length} Worker{req.offers.length > 1 ? 's' : ''} Offered
                            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    )}
                    {['open','offers_received'].includes(req.status) && (
                        <button
                            onClick={() => onCancel(req._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs uppercase rounded-xl cursor-pointer hover:bg-red-500/20 transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* ── Offers List ── */}
            <AnimatePresence>
                {expanded && req.offers?.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-slate-800"
                    >
                        <div className="p-4 space-y-3 bg-slate-900/40">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Star className="w-3 h-3 text-amber-400" />
                                Workers who responded — select one to confirm booking
                            </p>
                            {req.offers.map(offer => (
                                <OfferCard
                                    key={offer._id}
                                    offer={offer}
                                    onAccept={(offerId) => onAcceptOffer(req._id, offerId)}
                                    onChat={onChat}
                                    requestStatus={req.status}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const MyRequirements = () => {
    const { user, socket } = useAuth();
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatWorker, setChatWorker] = useState(null);

    const fetchRequirements = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/requests/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequirements(res.data);
        } catch (err) {
            console.error('Failed to load requirements:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchRequirements();

        if (socket) {
            socket.on('new_offer_received', ({ requestId }) => {
                fetchRequirements();
            });
            return () => socket.off('new_offer_received');
        }
    }, [user, socket]);

    const handleAcceptOffer = async (requestId, offerId) => {
        setAccepting(offerId);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `http://localhost:5000/api/requests/${requestId}/select-worker`,
                { offerId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchRequirements();
            if (res.data.booking) {
                setTimeout(() => navigate(`/customer/booking-details/${res.data.booking._id}`), 1200);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept offer');
        } finally {
            setAccepting(null);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this requirement?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/requests/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequirements();
        } catch { alert('Failed to cancel'); }
    };

    const stats = {
        open: requirements.filter(r => r.status === 'open').length,
        offers: requirements.filter(r => r.status === 'offers_received').length,
        confirmed: requirements.filter(r => r.status === 'confirmed').length,
    };

    return (
        <div className="min-h-screen font-sans pb-16" style={{ background: '#0F172A', color: '#fff' }}>

            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #0F172A 100%)', minHeight: '180px', borderRadius: '0 0 2rem 2rem' }}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <button onClick={() => navigate('/customer/home')} className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold mb-4 cursor-pointer">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </button>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white">My Requirements 📋</h1>
                            <p className="text-white/60 mt-1 text-sm">Track your posted requests and review worker offers.</p>
                        </div>
                        <button
                            onClick={() => navigate('/customer/post-requirement')}
                            className="flex items-center gap-2 bg-white text-orange-600 font-black text-sm px-5 py-3 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-all flex-shrink-0"
                        >
                            <Zap className="w-4 h-4" /> Post New
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Open', value: stats.open, icon: '🔵', color: '#3B82F6' },
                        { label: 'Offers In', value: stats.offers, icon: '📩', color: '#F59E0B' },
                        { label: 'Confirmed', value: stats.confirmed, icon: '✅', color: '#22C55E' },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className="bg-[#1E293B] border border-slate-700/40 rounded-2xl p-4 text-center">
                            <span className="text-2xl">{icon}</span>
                            <p className="text-2xl font-black text-white mt-1">{value}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Refresh */}
                <div className="flex justify-end">
                    <button onClick={fetchRequirements} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-slate-500 text-sm">Loading requirements...</p>
                    </div>
                ) : requirements.length === 0 ? (
                    <div className="flex flex-col items-center py-20 gap-5 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-4xl">📦</div>
                        <div>
                            <h3 className="text-white font-black text-xl">No requirements posted yet</h3>
                            <p className="text-slate-500 text-sm mt-1">Post your first requirement and get offers from nearby workers.</p>
                        </div>
                        <button
                            onClick={() => navigate('/customer/post-requirement')}
                            className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl cursor-pointer transition-colors shadow-lg shadow-orange-500/20"
                        >
                            <Zap className="w-4 h-4" /> Post Requirement
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {requirements.map(req => (
                            <RequestCard
                                key={req._id}
                                req={req}
                                onAcceptOffer={handleAcceptOffer}
                                onCancel={handleCancel}
                                onChat={(worker) => {
                                    if (!worker) return;
                                    const ids = [user._id, worker._id].sort();
                                    setChatWorker({ ...worker, chatId: ids.join('_') });
                                    setIsChatOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipient={chatWorker}
                booking={null}
            />
        </div>
    );
};

export default MyRequirements;
