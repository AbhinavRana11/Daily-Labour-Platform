import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    User, Phone, Mail, Check, ArrowLeft, ShieldCheck,
    MapPin, Star, Calendar, Briefcase, Edit3, X,
    Heart, Bell, CreditCard, Settings, LogOut, Clock,
    CheckCircle, TrendingUp, Award, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getAvatarUrl = (username = '') => {
    const avatars = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300",
    ];
    const idx = Math.abs(username.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % avatars.length;
    return avatars[idx];
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-4 flex flex-col gap-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
    </div>
);

const InfoRow = ({ icon, label, value, accent }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/30 rounded-2xl">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent || 'bg-slate-700/60 text-slate-300'}`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-white mt-0.5">{value || 'Not provided'}</p>
        </div>
    </div>
);

const QuickLink = ({ icon, label, sub, onClick, danger }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer text-left group
            ${danger
                ? 'bg-red-950/10 border-red-900/20 hover:bg-red-950/20 hover:border-red-800/40'
                : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/70 hover:border-slate-600/50'
            }`}
    >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-900/30 text-red-400' : 'bg-slate-700/60 text-slate-300'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className={`font-bold text-sm ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
            {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
        </div>
        <ChevronRight className={`w-4 h-4 ${danger ? 'text-red-500/50' : 'text-slate-600'} group-hover:translate-x-0.5 transition-transform`} />
    </button>
);

const CustomerProfile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, cancelled: 0 });

    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        setUsername(user.username || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/bookings/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const bookings = res.data || [];
            setStats({
                total: bookings.length,
                completed: bookings.filter(b => b.status === 'completed').length,
                pending: bookings.filter(b => ['pending', 'accepted', 'on_the_way'].includes(b.status)).length,
                cancelled: bookings.filter(b => b.status === 'cancelled').length,
            });
        } catch (e) {
            console.error('Stats fetch error:', e);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/auth/profile', { username, phone, address }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateUser(res.data);
            setMessage({ text: '✓ Profile updated successfully!', type: 'success' });
            setIsEditing(false);
        } catch (error) {
            setMessage({
                text: error.response?.data?.message || 'Failed to update. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    const avatar = getAvatarUrl(user.username || 'User');
    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : 'Member';

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">

            {/* ── Hero Banner ────────────────────────────────── */}
            <div className="relative h-52 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-black/20 rounded-full blur-3xl" />

                {/* Back button */}
                <button
                    onClick={() => navigate('/customer/home')}
                    className="absolute top-5 left-5 flex items-center gap-2 bg-black/20 hover:bg-black/30 backdrop-blur text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full border border-white/20 transition-all cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Dashboard
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 pb-16 space-y-6">

                {/* ── Profile Header Card ─────────────────────── */}
                <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-2xl">
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={avatar}
                                alt={user.username}
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl ring-2 ring-primary/30"
                            />
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full shadow" />
                        </div>

                        {/* Name & Meta */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-black text-white">{user.username}</h1>
                                <span className="flex items-center gap-1 bg-green-500/10 border border-green-500/25 text-green-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified
                                </span>
                            </div>
                            <p className="text-primary text-xs font-bold uppercase tracking-wider mt-1">Customer Account</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                                    <Mail className="w-3 h-3" />
                                    {user.email}
                                </span>
                                <span className="text-slate-700">•</span>
                                <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                                    <Calendar className="w-3 h-3" />
                                    Joined {joinDate}
                                </span>
                            </div>
                        </div>

                        {/* Edit button */}
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-500/20 flex-shrink-0"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit Profile
                        </button>
                    </div>

                    {/* Success / error message */}
                    <AnimatePresence>
                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-4 p-3 rounded-xl text-xs font-semibold border ${message.type === 'success'
                                    ? 'bg-green-950/30 border-green-800/40 text-green-400'
                                    : 'bg-red-950/30 border-red-800/40 text-red-400'
                                    }`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Stats Row ───────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard
                        icon={<Briefcase className="w-4 h-4" />}
                        label="Total Bookings"
                        value={statsLoading ? '—' : stats.total}
                        color="bg-blue-500/15 text-blue-400"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-4 h-4" />}
                        label="Completed"
                        value={statsLoading ? '—' : stats.completed}
                        color="bg-green-500/15 text-green-400"
                    />
                    <StatCard
                        icon={<Clock className="w-4 h-4" />}
                        label="Active / Pending"
                        value={statsLoading ? '—' : stats.pending}
                        color="bg-amber-500/15 text-amber-400"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-4 h-4" />}
                        label="Cancelled"
                        value={statsLoading ? '—' : stats.cancelled}
                        color="bg-red-500/15 text-red-400"
                    />
                </div>

                {/* ── Info + Edit side by side ─────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Personal Info */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Personal Info
                        </h2>

                        <InfoRow
                            icon={<User className="w-4 h-4" />}
                            label="Full Name"
                            value={user.username}
                            accent="bg-primary/10 text-primary"
                        />
                        <InfoRow
                            icon={<Mail className="w-4 h-4" />}
                            label="Email Address"
                            value={user.email}
                            accent="bg-blue-500/10 text-blue-400"
                        />
                        <InfoRow
                            icon={<Phone className="w-4 h-4" />}
                            label="Phone Number"
                            value={user.phone}
                            accent="bg-green-500/10 text-green-400"
                        />
                        <InfoRow
                            icon={<MapPin className="w-4 h-4" />}
                            label="Address"
                            value={user.address}
                            accent="bg-purple-500/10 text-purple-400"
                        />
                    </div>

                    {/* Account Actions */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-primary" />
                            Account
                        </h2>

                        <QuickLink
                            icon={<Briefcase className="w-4 h-4" />}
                            label="My Bookings"
                            sub="View all your service bookings"
                            onClick={() => navigate('/customer/bookings')}
                        />
                        <QuickLink
                            icon={<Heart className="w-4 h-4" />}
                            label="Favourite Workers"
                            sub="Workers you've saved"
                            onClick={() => navigate('/customer/favourites')}
                        />
                        <QuickLink
                            icon={<CreditCard className="w-4 h-4" />}
                            label="Payments & Invoices"
                            sub="View your payment history"
                            onClick={() => navigate('/customer/payments')}
                        />
                        <QuickLink
                            icon={<Bell className="w-4 h-4" />}
                            label="Notifications"
                            sub="Manage your alerts"
                            onClick={() => navigate('/customer/notifications')}
                        />
                        <QuickLink
                            icon={<LogOut className="w-4 h-4" />}
                            label="Sign Out"
                            sub="Log out of your account"
                            onClick={handleLogout}
                            danger
                        />
                    </div>
                </div>
            </div>

            {/* ── Edit Modal ─────────────────────────────────── */}
            <AnimatePresence>
                {isEditing && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                            onClick={() => setIsEditing(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 60, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 60, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
                        >
                            <div className="bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl p-7">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-white">Edit Profile</h3>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-4">
                                    {[
                                        { label: 'Full Name', value: username, setter: setUsername, type: 'text', placeholder: 'Your name' },
                                        { label: 'Phone Number', value: phone, setter: setPhone, type: 'tel', placeholder: '+91 98765 43210' },
                                        { label: 'Address', value: address, setter: setAddress, type: 'text', placeholder: 'Your city / area' },
                                    ].map(({ label, value, setter, type, placeholder }) => (
                                        <div key={label} className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {label}
                                            </label>
                                            <input
                                                type={type}
                                                value={value}
                                                onChange={e => setter(e.target.value)}
                                                placeholder={placeholder}
                                                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder-slate-600"
                                            />
                                        </div>
                                    ))}

                                    <div className="pt-2 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                                        >
                                            {loading ? (
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerProfile;
