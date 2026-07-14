import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, ShieldCheck, CheckCircle2, MessageSquare, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([
        { id: 1, type: 'status_accept', text: 'Worker Rahul Kumar accepted your Plumber booking request.', time: '10 mins ago', icon: <CheckCircle2 className="w-5 h-5 text-green-400" /> },
        { id: 2, type: 'journey', text: 'Worker Started Journey: Rahul Kumar is traveling to your location.', time: '8 mins ago', icon: <Clock className="w-5 h-5 text-primary" /> },
        { id: 3, type: 'message', text: 'New Message from Rahul Kumar: "Hello Sir, I\'m on the way."', time: '5 mins ago', icon: <MessageSquare className="w-5 h-5 text-primary" /> },
        { id: 4, type: 'arrived', text: 'Worker Arrived: Handyman reached Connaught Place office.', time: 'Just now', icon: <ShieldCheck className="w-5 h-5 text-green-400" /> }
    ]);

    const handleClearAll = () => {
        setNotifications([]);
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Back</span>
                </button>

                <div className="flex justify-between items-center border-b border-slate-800 pb-5">
                    <div>
                        <h1 className="text-3xl font-heading font-black tracking-tight flex items-center space-x-2">
                            <Bell className="w-8 h-8 text-primary animate-pulse" />
                            <span>Notifications</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Real-time alerts, booking statuses, messages, and transaction logs.</p>
                    </div>

                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-primary font-bold hover:underline cursor-pointer"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map(item => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-4.5 rounded-2xl shadow flex justify-between items-center gap-4"
                            >
                                <div className="flex items-center space-x-3.5">
                                    <span className="bg-slate-950/45 p-3 rounded-xl border border-slate-800 shadow-inner shrink-0">
                                        {item.icon}
                                    </span>
                                    <div>
                                        <p className="text-slate-200 text-xs font-semibold leading-relaxed">{item.text}</p>
                                        <span className="text-[9px] text-slate-500 font-bold block mt-1">{item.time}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="bg-slate-800/20 border border-slate-850 border-dashed p-12 rounded-3xl text-center text-slate-450 uppercase font-bold tracking-widest text-xs">
                            No notifications active
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Notifications;
