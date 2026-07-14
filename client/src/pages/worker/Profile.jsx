import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    User, Phone, Mail, Check, ArrowLeft, ShieldCheck, 
    Briefcase, Award, FileText, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form fields
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [profession, setProfession] = useState('');
    const [rate, setRate] = useState('');
    const [bio, setBio] = useState('');
    const [experience, setExperience] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setUsername(user.username || '');
        setPhone(user.phone || '');
        setProfession(user.profession || '');
        setRate(user.rate || '350');
        setBio(user.bio || '');
        setExperience(user.experience || '5');
    }, [user, navigate]);

    if (!user) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const token = localStorage.getItem('token');
            const payload = {
                username,
                phone,
                profession,
                rate: Number(rate),
                bio,
                experience: Number(experience)
            };

            const res = await axios.put('http://localhost:5000/api/auth/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            updateUser(res.data);
            setMessage({ text: 'Worker profile details updated successfully!', type: 'success' });
            setIsEditing(false);
        } catch (error) {
            console.error("Worker profile save error:", error);
            setMessage({ 
                text: error.response?.data?.message || 'Failed to save changes. Please try again.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const avatar = getAvatarUrl(user.username || 'Worker');

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Banner decorative */}
                    <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-600 relative opacity-85">
                        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]"></div>
                    </div>

                    <div className="px-6 pb-8 relative">
                        {/* Avatar */}
                        <div className="absolute -top-14 left-6">
                            <div className="relative">
                                <img 
                                    src={avatar} 
                                    alt={user.username} 
                                    className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-800 shadow-xl"
                                />
                                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full"></span>
                            </div>
                        </div>

                        {/* Edit Cancel buttons */}
                        <div className="flex justify-end pt-4 gap-2">
                            <button
                                onClick={() => navigate('/worker/portfolio')}
                                className="px-5 py-2 bg-slate-700 hover:bg-slate-650 text-white font-bold rounded-full border border-slate-600/50 transition-all text-xs uppercase tracking-wider cursor-pointer"
                            >
                                Portfolio Work
                            </button>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-5 py-2 bg-primary hover:bg-primaryDark text-white font-bold rounded-full shadow-lg shadow-orange-500/20 transition-all text-xs uppercase tracking-wider cursor-pointer"
                                >
                                    Edit Settings
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setMessage({ text: '', type: '' });
                                    }}
                                    className="px-5 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white font-bold rounded-full transition-all text-xs border border-slate-750 uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {/* Heading titles */}
                        <div className="mt-8 space-y-1">
                            <div className="flex items-center space-x-2">
                                <h2 className="text-3xl font-heading font-black tracking-tight">{user.username}</h2>
                                <ShieldCheck className="w-5.5 h-5.5 text-green-400" />
                            </div>
                            <p className="text-primary font-bold text-xs uppercase tracking-wider">{user.profession || 'Handyman Specialization'}</p>
                        </div>

                        {/* Alerts */}
                        <AnimatePresence>
                            {message.text && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className={`mt-5 p-4 rounded-2xl border text-xs font-semibold ${
                                        message.type === 'success' 
                                            ? 'bg-green-950/20 border-green-900/55 text-green-450' 
                                            : 'bg-red-950/20 border-red-900/55 text-red-450'
                                    }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Views and Edits panels */}
                        {!isEditing ? (
                            <div className="mt-8 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-850 flex items-center space-x-4">
                                        <div className="bg-slate-800 p-2.5 rounded-xl text-primary"><Mail className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Email</p>
                                            <p className="text-sm font-semibold mt-0.5">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-850 flex items-center space-x-4">
                                        <div className="bg-slate-800 p-2.5 rounded-xl text-primary"><Phone className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Phone</p>
                                            <p className="text-sm font-semibold mt-0.5">{user.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-850 flex items-center space-x-4">
                                        <div className="bg-slate-800 p-2.5 rounded-xl text-primary"><Briefcase className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Hourly Rate</p>
                                            <p className="text-sm font-semibold mt-0.5">₹{user.rate || '350'} / hr</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-850 flex items-center space-x-4">
                                        <div className="bg-slate-800 p-2.5 rounded-xl text-primary"><Award className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Experience</p>
                                            <p className="text-sm font-semibold mt-0.5">{user.experience || '5'} Years</p>
                                        </div>
                                    </div>
                                </div>

                                {user.bio && (
                                    <div className="bg-slate-900/20 p-5 rounded-2xl border border-slate-850 space-y-2">
                                        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Professional Bio</h4>
                                        <p className="text-slate-300 text-xs leading-relaxed italic">"{user.bio}"</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="mt-8 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                                        <input
                                            type="text"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profession Specialization</label>
                                        <select
                                            value={profession}
                                            onChange={(e) => setProfession(e.target.value)}
                                            className="w-full bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all font-bold"
                                        >
                                            <option value="Plumber">Plumber</option>
                                            <option value="Electrician">Electrician</option>
                                            <option value="Carpenter">Carpenter</option>
                                            <option value="Housekeeper">Housekeeper</option>
                                            <option value="Painter">Painter</option>
                                            <option value="Mason">Mason</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hourly Rate (₹/hr)</label>
                                        <input
                                            type="number"
                                            required
                                            value={rate}
                                            onChange={(e) => setRate(e.target.value)}
                                            className="w-full bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Years Experience</label>
                                        <input
                                            type="number"
                                            required
                                            value={experience}
                                            onChange={(e) => setExperience(e.target.value)}
                                            className="w-full bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Bio Statement</label>
                                    <textarea
                                        rows="4"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Introduce your skills, certifications, and reliability to potential clients..."
                                        className="w-full bg-slate-900/40 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all font-semibold leading-relaxed"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-primary hover:bg-primaryDark text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-1.5 text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerProfile;
