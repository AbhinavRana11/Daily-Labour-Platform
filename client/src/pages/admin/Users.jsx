import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Users, Trash2, ArrowLeft, Search, Mail, Phone, Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching customers directory:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this customer account? All associated bookings will be preserved for history.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(prev => prev.filter(u => u._id !== id));
            alert("Customer account deleted successfully.");
        } catch (err) {
            console.error("Error deleting customer:", err);
            alert("Failed to delete customer.");
        }
    };

    const filteredUsers = users.filter(u => 
        (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
                            <Users className="w-8 h-8 text-primary" />
                            <span>Customers Directory</span>
                        </h1>
                        <p className="text-slate-400 text-sm">Monitor and manage registered customer accounts on the Daily Labour platform.</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-2xl flex items-center max-w-md">
                    <Search className="w-5 h-5 text-slate-450 ml-2.5 shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Search by customer name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-white focus:outline-none text-xs w-full pl-3 pr-2 py-1.5 font-semibold placeholder-slate-500"
                    />
                </div>

                {/* Directory List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-450 font-semibold">Searching customer accounts...</div>
                    ) : filteredUsers.length > 0 ? (
                        <AnimatePresence>
                            {filteredUsers.map((item) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 shadow-xl flex justify-between items-center gap-4"
                                >
                                    <div className="space-y-1.5 min-w-0">
                                        <h4 className="font-bold text-white text-base leading-tight truncate">{item.username}</h4>
                                        
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold">
                                            <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {item.email}</span>
                                            {item.phone && <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {item.phone}</span>}
                                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Joined {new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-900 rounded-2xl text-red-400 transition-all shrink-0 cursor-pointer"
                                        title="Delete Customer Account"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-16 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl text-slate-500 text-xs font-bold uppercase tracking-wider">
                            No registered customers found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
