import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Clock, Check, ArrowLeft, Settings, Shield, ToggleLeft, ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const WorkerSettings = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [rate, setRate] = useState('');
    const [isSavingRate, setIsSavingRate] = useState(false);
    
    const [serviceRadius, setServiceRadius] = useState(10);
    const [isSavingRadius, setIsSavingRadius] = useState(false);

    const [isAvailable, setIsAvailable] = useState(true);
    const [isSavingAvailability, setIsSavingAvailability] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsAvailable(user.isAvailable !== false);
        setRate(user.rate || '350');
        setServiceRadius(user.serviceRadius || 10);
    }, [user, navigate]);

    const handleToggleAvailability = async () => {
        setIsSavingAvailability(true);
        try {
            const token = localStorage.getItem('token');
            const newAvailability = !isAvailable;
            await axios.put('http://localhost:5000/api/auth/worker/availability', {
                isAvailable: newAvailability
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAvailable(newAvailability);
            updateUser({ isAvailable: newAvailability });
        } catch (err) {
            console.error("Error setting availability:", err);
        } finally {
            setIsSavingAvailability(false);
        }
    };

    const handleSaveRate = async () => {
        setIsSavingRate(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/worker/price', {
                rate: Number(rate)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateUser({ rate: Number(rate) });
            alert("Hourly rate saved.");
        } catch (err) {
            console.error("Error saving rate:", err);
        } finally {
            setIsSavingRate(false);
        }
    };

    const handleSaveRadius = async (radius) => {
        setIsSavingRadius(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/worker/radius', {
                serviceRadius: Number(radius)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServiceRadius(radius);
            updateUser({ serviceRadius: radius });
        } catch (err) {
            console.error("Error saving radius:", err);
        } finally {
            setIsSavingRadius(false);
        }
    };

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

                <div className="space-y-1">
                    <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2.5">
                        <Settings className="w-8 h-8 text-primary" />
                        <span>Worker Settings</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Configure availability, search radius, pricing rates, and account parameters.</p>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
                    
                    {/* Status switch */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-750 gap-4">
                        <div>
                            <h3 className="font-bold text-white text-base">Want work today?</h3>
                            <p className="text-xs text-slate-400 leading-normal mt-1">Automatically allow or deny incoming client service requests.</p>
                        </div>
                        <button
                            onClick={handleToggleAvailability}
                            disabled={isSavingAvailability}
                            className={`w-14 h-7.5 rounded-full p-1 transition-colors relative focus:outline-none cursor-pointer ${isAvailable ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${isAvailable ? 'translate-x-6.5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Rate editor */}
                    <div className="space-y-4 pb-6 border-b border-slate-750">
                        <div>
                            <h3 className="font-bold text-white text-base">Hourly Rate</h3>
                            <p className="text-xs text-slate-400 leading-normal mt-1">Configure your default price rate displayed to customers.</p>
                        </div>
                        <div className="flex gap-3 max-w-sm">
                            <div className="relative flex-grow">
                                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                                <input 
                                    type="number" 
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    className="w-full bg-slate-900/40 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-bold"
                                />
                            </div>
                            <button
                                onClick={handleSaveRate}
                                disabled={isSavingRate}
                                className="bg-primary hover:bg-primaryDark text-white font-bold px-6 rounded-xl text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                            >
                                Save Price
                            </button>
                        </div>
                    </div>

                    {/* Radius selector */}
                    <div className="space-y-4 pb-6 border-b border-slate-750">
                        <div>
                            <h3 className="font-bold text-white text-base">Service radius limit</h3>
                            <p className="text-xs text-slate-400 leading-normal mt-1">Define search limits within which customers will find your profile.</p>
                        </div>
                        <div className="grid grid-cols-4 gap-3 max-w-md">
                            {[5, 10, 15, 20].map(dist => (
                                <button
                                    key={dist}
                                    onClick={() => handleSaveRadius(dist)}
                                    className={`py-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                                        serviceRadius === dist 
                                            ? 'bg-primary border-primary text-white shadow-md' 
                                            : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/40'
                                    }`}
                                >
                                    {dist} KM
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Schedule info hours */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-white text-base flex items-center space-x-1.5">
                                <Shield className="w-5 h-5 text-primary" />
                                <span>Default Operating Schedule</span>
                            </h3>
                            <p className="text-xs text-slate-400 leading-normal mt-1">Working schedule shifts are set to 9:00 AM - 6:00 PM Indian Standard Time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerSettings;
