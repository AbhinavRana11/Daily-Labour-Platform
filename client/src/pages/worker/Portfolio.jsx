import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Plus, Trash2, ArrowLeft, Image, Upload, FileText, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkerPortfolio = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [portfolio, setPortfolio] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [imgUrl, setImgUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setPortfolio(user.portfolio || []);
    }, [user, navigate]);

    const handleAddPreset = async (presetUrl) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const updatedPortfolio = [...portfolio, presetUrl];
            
            const res = await axios.put('http://localhost:5000/api/auth/profile', {
                portfolio: updatedPortfolio
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            updateUser(res.data);
            setPortfolio(updatedPortfolio);
            setImgUrl('');
            setIsAdding(false);
            alert("Portfolio work sample added successfully.");
        } catch (err) {
            console.error("Failed to append portfolio sample:", err);
            alert("Failed to append work sample.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (urlToDelete) => {
        if (!window.confirm("Are you sure you want to delete this portfolio sample?")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const updatedPortfolio = portfolio.filter(p => p !== urlToDelete);

            const res = await axios.put('http://localhost:5000/api/auth/profile', {
                portfolio: updatedPortfolio
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            updateUser(res.data);
            setPortfolio(updatedPortfolio);
            alert("Portfolio work sample deleted.");
        } catch (err) {
            console.error("Failed to delete portfolio sample:", err);
            alert("Failed to delete work sample.");
        } finally {
            setLoading(false);
        }
    };

    const presets = [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400", // Cleaning setup
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400", // Electrical fixes
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400", // Carpentry works
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400", // Painting walls
        "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=400"  // Plumbing tubes
    ];

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/worker/profile')}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Settings</span>
                </button>

                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-heading font-black tracking-tight">Work Portfolio</h1>
                        <p className="text-slate-400 text-sm">Upload, manage, and share samples of your previous projects with customers.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-primary hover:bg-primaryDark text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Work Sample</span>
                    </button>
                </div>

                {/* Preset add overlay popup */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl space-y-5 overflow-hidden"
                        >
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Add Mockup Work Image</h3>
                            
                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paste Custom Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/photo-..."
                                        value={imgUrl}
                                        onChange={(e) => setImgUrl(e.target.value)}
                                        className="flex-grow bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-semibold"
                                    />
                                    <button
                                        onClick={() => imgUrl && handleAddPreset(imgUrl)}
                                        disabled={loading || !imgUrl}
                                        className="bg-primary hover:bg-primaryDark text-white font-bold px-6 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or Select Preset Work Samples</p>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {presets.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAddPreset(preset)}
                                            disabled={loading}
                                            className="h-20 rounded-xl overflow-hidden border border-slate-750 relative hover:border-primary transition-all hover:scale-[1.02] active:scale-98 shrink-0 cursor-pointer"
                                        >
                                            <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 hover:bg-transparent"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Portfolio Gallery grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {portfolio.length > 0 ? (
                        portfolio.map((url, idx) => (
                            <div 
                                key={idx} 
                                className="h-44 rounded-3xl overflow-hidden border border-slate-700/50 shadow-lg relative group"
                            >
                                <img src={url} alt={`Work sample ${idx + 1}`} className="w-full h-full object-cover" />
                                
                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <button
                                        onClick={() => handleDelete(url)}
                                        disabled={loading}
                                        className="p-3 bg-red-600 hover:bg-red-750 text-white rounded-2xl shadow-xl transition-all scale-95 group-hover:scale-100 cursor-pointer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                            No work samples added to your portfolio gallery yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkerPortfolio;
