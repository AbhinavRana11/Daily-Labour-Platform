import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Trash2, Home, Briefcase, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SavedAddresses = () => {
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([
        { id: 1, type: 'Home', address: 'Sector 62, Noida, Uttar Pradesh, 201301', coords: { lat: 28.6273, lng: 77.3725 } },
        { id: 2, type: 'Office', address: 'Connaught Place, New Delhi, Delhi, 110001', coords: { lat: 28.6304, lng: 77.2177 } }
    ]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newType, setNewType] = useState('Home');
    const [newAddressStr, setNewAddressStr] = useState('');

    const handleDelete = (id) => {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        if (!newAddressStr.trim()) return;

        const newAddr = {
            id: Date.now(),
            type: newType,
            address: newAddressStr,
            coords: { lat: 28.6139, lng: 77.2090 } 
        };

        setAddresses(prev => [...prev, newAddr]);
        setNewAddressStr('');
        setIsAddOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Back</span>
                </button>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2">
                            <MapPin className="w-8 h-8 text-primary animate-bounce" />
                            <span>Saved Addresses</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Manage and select saved locations for instant scheduling address matching.</p>
                    </div>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-primary hover:bg-primaryDark text-white font-heading font-black text-xs py-2.5 px-5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-all shadow shadow-orange-500/10 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Address</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map(item => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-3xl shadow-xl flex justify-between items-start"
                        >
                            <div className="flex items-start space-x-3.5">
                                <span className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-inner mt-0.5 text-primary">
                                    {item.type === 'Home' ? <Home className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                                </span>
                                <div>
                                    <h4 className="font-heading font-black text-white text-base leading-none">{item.type}</h4>
                                    <p className="text-slate-355 text-xs font-semibold mt-3.5 leading-relaxed">{item.address}</p>
                                    <span className="text-[9px] text-slate-500 font-bold block mt-2">Coords: {item.coords.lat.toFixed(4)}, {item.coords.lng.toFixed(4)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-red-950/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors border border-transparent hover:border-red-900/35 cursor-pointer"
                                title="Delete address"
                            >
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                        </motion.div>
                    ))}
                </div>

            </div>

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
                        >
                            <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 text-slate-450 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                            
                            <h3 className="font-heading font-black text-lg text-white mb-6">Add New Address</h3>

                            <form onSubmit={handleAddAddress} className="space-y-4 text-xs font-bold">
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase text-slate-455">Address Label</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Home', 'Office'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNewType(type)}
                                                className={`py-3 rounded-xl border font-black uppercase text-[10px] cursor-pointer ${newType === type ? 'bg-primary border-primary text-white' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase text-slate-450 font-bold">Full Address details</label>
                                    <textarea
                                        placeholder="Enter house, street, city and zip code particulars..."
                                        rows={3}
                                        value={newAddressStr}
                                        onChange={(e) => setNewAddressStr(e.target.value)}
                                        className="w-full bg-slate-955/45 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-white font-semibold"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-primary hover:bg-primaryDark text-white font-heading font-black uppercase tracking-wider rounded-xl shadow mt-2 cursor-pointer"
                                >
                                    Confirm Address
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default SavedAddresses;
