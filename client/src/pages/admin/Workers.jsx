import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Users, Trash2, ArrowLeft, Search, Mail, Phone, Briefcase, 
    Star, Calendar, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminWorkers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/auth/labours');
            setWorkers(res.data);
        } catch (err) {
            console.error("Error fetching workers directory:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchWorkers();
    }, [user, navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this worker profile? This action is permanent and cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/auth/labours/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(prev => prev.filter(w => w._id !== id));
            alert("Worker profile deleted successfully.");
        } catch (err) {
            console.error("Error deleting worker:", err);
            alert("Failed to delete worker profile.");
        }
    };

    const filteredWorkers = workers.filter(w => 
        (w.username && w.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (w.profession && w.profession.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2.5">
                            <Briefcase className="w-8 h-8 text-primary" />
                            <span>Workers Directory</span>
                        </h1>
                        <p className="text-slate-400 text-sm">Review, verify, or remove registered handyman and contractor specialists.</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-2xl flex items-center max-w-md">
                    <Search className="w-5 h-5 text-slate-450 ml-2.5 shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Search by worker name or profession..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-white focus:outline-none text-xs w-full pl-3 pr-2 py-1.5 font-semibold placeholder-slate-500"
                    />
                </div>

                {/* Directory List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-455 font-semibold">Searching worker directories...</div>
                    ) : filteredWorkers.length > 0 ? (
                        <AnimatePresence>
                            {filteredWorkers.map((item) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-xl flex justify-between items-center gap-4"
                                >
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-bold text-white text-base leading-tight truncate">{item.username}</h4>
                                            <ShieldCheck className="w-4.5 h-4.5 text-green-400" />
                                        </div>
                                        <p className="text-primary font-bold text-xs uppercase tracking-wider">{item.profession || 'Handyman'}</p>
                                        
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold">
                                            <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {item.email}</span>
                                            {item.phone && <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {item.phone}</span>}
                                            <span className="flex items-center"><Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-current" /> {item.rating || 4.8} / 5</span>
                                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Exp: {item.experience || 5} Years</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-900 rounded-2xl text-red-400 transition-all shrink-0 cursor-pointer"
                                        title="Delete Worker Account"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-16 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                            No registered workers found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminWorkers;
