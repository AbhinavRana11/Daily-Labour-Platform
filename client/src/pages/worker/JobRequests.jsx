import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin, Clock, DollarSign, Calendar, ArrowLeft,
    Zap, Send, X, Check, Loader2, ChevronDown, Star, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICE_EMOJIS = { Electrician:'⚡',Plumber:'🚰',Painter:'🎨',Carpenter:'🛠️',Mason:'🧱',Housekeeper:'🏠',Cleaner:'🧹',Gardener:'🌿',Mechanic:'🔧',Other:'👷' };
const URGENCY_CONFIG = {
    emergency: { label:'🚨 Emergency', color:'text-red-400', bg:'bg-red-500/10 border-red-500/25' },
    today:     { label:'☀️ Today',     color:'text-amber-400', bg:'bg-amber-500/10 border-amber-500/25' },
    tomorrow:  { label:'📅 Tomorrow',  color:'text-blue-400', bg:'bg-blue-500/10 border-blue-500/25' },
    scheduled: { label:'🗓️ Scheduled', color:'text-slate-400', bg:'bg-slate-700/30 border-slate-600/30' },
};

// ── Send Offer Modal ───────────────────────────────────────────────────────────
const SendOfferModal = ({ request, onClose, onSubmit }) => {
    const [price, setPrice] = useState(request?.budgetMin || 300);
    const [eta, setEta] = useState('30 Minutes');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit({ price, estimatedArrival: eta, message });
        setLoading(false);
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div initial={{ y: 60, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                    className="bg-[#1E293B] border border-slate-700/60 rounded-3xl shadow-2xl p-6 w-full max-w-md"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-white font-black text-lg">Send Your Offer</h3>
                            <p className="text-slate-400 text-xs mt-0.5">{request?.title}</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Your Price (₹)</label>
                            <input
                                type="number" min="1" required
                                value={price} onChange={e => setPrice(Number(e.target.value))}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white font-black text-lg focus:outline-none focus:border-primary transition-colors"
                            />
                            <p className="text-slate-500 text-[10px] mt-1">Customer budget: ₹{request?.budgetMin} – ₹{request?.budgetMax}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Estimated Arrival Time</label>
                            <select
                                value={eta} onChange={e => setEta(e.target.value)}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            >
                                {['15 Minutes','30 Minutes','45 Minutes','1 Hour','2 Hours','Today'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Message to Customer (Optional)</label>
                            <textarea
                                rows={3}
                                placeholder="e.g. I can come within 30 minutes. I have all required tools."
                                value={message} onChange={e => setMessage(e.target.value)}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-black rounded-2xl transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {loading ? 'Sending Offer...' : `Send Offer — ₹${price}`}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ── Request Card ───────────────────────────────────────────────────────────────
const RequestCard = ({ req, myOffers, onSendOffer, onIgnore }) => {
    const urgCfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.today;
    const myOffer = myOffers.find(o => o.request?._id === req._id || o.request === req._id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, borderColor: 'rgba(245,158,11,0.35)' }}
            className="bg-[#1E293B] border border-slate-700/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-200"
        >
            {req.urgency === 'emergency' && (
                <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-red-400 text-xs font-black uppercase tracking-wider">🚨 Emergency — Customer needs help within 1 hour</p>
                </div>
            )}

            <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0 border border-slate-700/40">
                        {SERVICE_EMOJIS[req.service] || '👷'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="text-white font-black text-base leading-tight">{req.title}</h3>
                                <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">{req.service}</p>
                            </div>
                            <div className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${urgCfg.bg} ${urgCfg.color}`}>
                                {urgCfg.label}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60 text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Budget</p>
                        <p className="text-white font-black text-xs mt-0.5">₹{req.budgetMin}–{req.budgetMax}</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60 text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Date</p>
                        <p className="text-white font-black text-xs mt-0.5">
                            {req.date ? new Date(req.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : 'Flexible'}
                        </p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60 text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Time</p>
                        <p className="text-white font-black text-xs mt-0.5">{req.time || 'Flexible'}</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60 text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Distance</p>
                        <p className="text-white font-black text-xs mt-0.5">{req.distance ? `${req.distance} km` : 'Nearby'}</p>
                    </div>
                </div>

                {req.description && (
                    <p className="text-slate-400 text-xs leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 line-clamp-2">
                        {req.description}
                    </p>
                )}

                {req.address && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        {req.address}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    {myOffer ? (
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/25 rounded-2xl">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-green-400 font-black text-xs">Offer Sent — ₹{myOffer.price}</p>
                                <p className="text-slate-500 text-[10px]">{myOffer.estimatedArrival} • {myOffer.status}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => onSendOffer(req)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-black text-xs uppercase rounded-2xl transition-all cursor-pointer shadow-lg shadow-orange-500/15"
                            >
                                <Send className="w-3.5 h-3.5" /> Send Offer
                            </button>
                            <button
                                onClick={() => onIgnore(req._id)}
                                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 text-slate-400 font-bold text-xs uppercase rounded-2xl transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" /> Ignore
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const WorkerJobRequests = () => {
    const { user, socket } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState('nearby'); // nearby | booking_requests
    const [nearbyRequests, setNearbyRequests] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [myOffers, setMyOffers] = useState([]);
    const [ignored, setIgnored] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [serviceFilter, setServiceFilter] = useState('all');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [nearbyRes, bookRes, offersRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/requests/nearby?service=${serviceFilter}`, { headers }),
                axios.get('http://localhost:5000/api/bookings', { headers }),
                axios.get('http://localhost:5000/api/offers/my', { headers }),
            ]);
            setNearbyRequests(nearbyRes.data.filter(r => !ignored.includes(r._id)));
            setBookingRequests(bookRes.data.filter(b => b.status === 'pending'));
            setMyOffers(offersRes.data);
        } catch (err) {
            console.error('Failed to load:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchAll();
        if (socket) {
            socket.on('new_request_nearby', () => fetchAll());
            socket.on('offer_accepted', ({ bookingId }) => {
                navigate(`/worker/today-jobs`);
            });
            return () => { socket.off('new_request_nearby'); socket.off('offer_accepted'); };
        }
    }, [user, socket, serviceFilter]);

    const handleSendOffer = async ({ price, estimatedArrival, message }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/offers', {
                requestId: selectedRequest._id,
                price, estimatedArrival, message
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedRequest(null);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send offer');
        }
    };

    const handleAcceptBooking = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${id}`, { status: 'accepted' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAll();
            navigate('/worker/today-jobs');
        } catch { alert('Failed to accept'); }
    };

    const handleRejectBooking = async (id) => {
        if (!window.confirm('Reject this request?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${id}`, { status: 'rejected' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAll();
        } catch { alert('Failed to reject'); }
    };

    const visibleNearby = nearbyRequests.filter(r => !ignored.includes(r._id));

    return (
        <div className="min-h-screen font-sans pb-16" style={{ background: '#0F172A', color: '#fff' }}>

            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '160px' }}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-orange-500" />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <button onClick={() => navigate('/worker/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-4 cursor-pointer transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </button>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-2">
                                Job Requests <span className="text-2xl">📋</span>
                            </h1>
                            <p className="text-slate-400 mt-1 text-sm">Customer requirements posted near you — send your best offer!</p>
                        </div>
                        <button onClick={fetchAll} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold cursor-pointer transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-6 space-y-5">

                {/* Tabs */}
                <div className="flex gap-2">
                    {[
                        { key: 'nearby', label: '📍 Nearby Requirements', count: visibleNearby.length },
                        { key: 'bookings', label: '📩 Booking Requests', count: bookingRequests.length },
                    ].map(({ key, label, count }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                tab === key ? 'bg-primary text-white border-primary shadow-lg shadow-orange-500/20' : 'bg-[#1E293B] text-slate-400 border-slate-700/40 hover:text-white'
                            }`}
                        >
                            {label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab === key ? 'bg-white/20' : 'bg-slate-700 text-slate-400'}`}>{count}</span>
                        </button>
                    ))}
                </div>

                {/* Service filter for nearby */}
                {tab === 'nearby' && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {['all','Electrician','Plumber','Painter','Carpenter','Mason','Housekeeper','Cleaner','Gardener','Mechanic'].map(s => (
                            <button key={s} onClick={() => setServiceFilter(s)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                    serviceFilter === s ? 'bg-primary text-white border-primary' : 'bg-[#1E293B] text-slate-400 border-slate-700/40 hover:text-white'
                                }`}
                            >
                                {SERVICE_EMOJIS[s] || '🔍'} {s === 'all' ? 'All Services' : s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-slate-500 text-sm">Loading requests...</p>
                    </div>
                ) : tab === 'nearby' ? (
                    visibleNearby.length > 0 ? (
                        <div className="space-y-4">
                            {visibleNearby.map(req => (
                                <RequestCard
                                    key={req._id}
                                    req={req}
                                    myOffers={myOffers}
                                    onSendOffer={setSelectedRequest}
                                    onIgnore={id => setIgnored(prev => [...prev, id])}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-20 gap-4 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-4xl">📭</div>
                            <h3 className="text-white font-black text-xl">No requirements nearby</h3>
                            <p className="text-slate-500 text-sm">New customer requirements will appear here in real time.</p>
                        </div>
                    )
                ) : (
                    bookingRequests.length > 0 ? (
                        <div className="space-y-4">
                            {bookingRequests.map(req => (
                                <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#1E293B] border border-slate-700/40 rounded-3xl p-5 space-y-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-black text-sm border border-primary/25">
                                            {(req.user?.username || 'C').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-black">{req.user?.username || 'Customer'}</p>
                                            <p className="text-slate-400 text-xs">{req.user?.email}</p>
                                        </div>
                                        <span className="ml-auto text-white font-black text-lg">₹{req.totalPrice}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800">
                                            <p className="text-slate-500 text-[9px] font-bold uppercase">Date</p>
                                            <p className="text-white font-bold mt-0.5">{new Date(req.date).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800">
                                            <p className="text-slate-500 text-[9px] font-bold uppercase">Hours</p>
                                            <p className="text-white font-bold mt-0.5">{req.hours}h</p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800">
                                            <p className="text-slate-500 text-[9px] font-bold uppercase">Time</p>
                                            <p className="text-white font-bold mt-0.5">{req.scheduledTime || 'Flexible'}</p>
                                        </div>
                                    </div>
                                    {req.notes && <p className="text-slate-400 text-xs italic bg-slate-900/40 p-3 rounded-xl border border-slate-800">"{req.notes}"</p>}
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAcceptBooking(req._id)}
                                            className="flex-1 py-3 bg-primary hover:bg-orange-600 text-white font-black text-xs uppercase rounded-xl transition-colors cursor-pointer shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" /> Accept Job
                                        </button>
                                        <button onClick={() => handleRejectBooking(req._id)}
                                            className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                        <button onClick={() => navigate(`/worker/job-details/${req._id}`)}
                                            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-20 gap-4 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-4xl">📭</div>
                            <h3 className="text-white font-black text-xl">No pending booking requests</h3>
                        </div>
                    )
                )}
            </div>

            {/* Send Offer Modal */}
            {selectedRequest && (
                <SendOfferModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onSubmit={handleSendOffer}
                />
            )}
        </div>
    );
};

export default WorkerJobRequests;
