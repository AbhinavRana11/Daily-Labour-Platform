import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, ChevronRight, AlertCircle, ArrowLeft, HeartHandshake } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ isOpen, onClose, labour }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // Steps: 1 (Date/Time), 2 (Location/Notes), 3 (Success)
    const [loading, setLoading] = useState(false);
    
    // Booking Form State
    const [bookingData, setBookingData] = useState({
        date: '',
        timeSlot: '09:00 AM',
        hours: 4,
        location: user?.address?.city || '',
        notes: ''
    });

    const [confNumber, setConfNumber] = useState('');

    if (!isOpen || !labour) return null;

    const totalPrice = bookingData.hours * labour.rate;

    const handleNextStep = () => {
        if (step === 1) {
            if (!bookingData.date) {
                alert("Please select a date first.");
                return;
            }
            setStep(2);
        }
    };

    const handlePrevStep = () => {
        if (step === 2) setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bookingData.location) {
            alert("Please enter a work address.");
            return;
        }
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please log in to book a service.");
                onClose();
                navigate('/login');
                return;
            }

            const payload = {
                labourId: labour._id || labour.id,
                date: `${bookingData.date}T${bookingData.timeSlot === '09:00 AM' ? '09:00:00' : bookingData.timeSlot === '11:00 AM' ? '11:00:00' : bookingData.timeSlot === '02:00 PM' ? '14:00:00' : '16:00:00'}`,
                hours: Number(bookingData.hours),
                totalPrice: totalPrice,
                location: { address: bookingData.location },
                notes: bookingData.notes
            };

            await axios.post('http://localhost:5000/api/bookings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Generate a random mock confirmation ID
            const mockConf = 'DL-' + Math.random().toString(36).substr(2, 5).toUpperCase();
            setConfNumber(mockConf);
            setStep(3); // Go to success step!
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            if (error.response?.status === 401) {
                alert("Session expired. Please log in again.");
                logout();
                onClose();
                navigate('/login');
            } else {
                alert(`Failed to create booking: ${message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDone = () => {
        setStep(1);
        setBookingData({
            date: '',
            timeSlot: '09:00 AM',
            hours: 4,
            location: user?.address?.city || '',
            notes: ''
        });
        onClose();
    };

    // Time slots definition (Step 6)
    const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', duration: 0.4 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white border-b border-slate-800 shrink-0">
                        <div className="flex items-center space-x-2">
                            {step === 2 && (
                                <button onClick={handlePrevStep} className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white mr-1">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            )}
                            <h3 className="font-extrabold text-base">
                                {step === 3 ? 'Booking Complete!' : 'Book Service'}
                            </h3>
                        </div>
                        {step !== 3 && (
                            <button onClick={onClose} className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Progress Indicator Bar */}
                    {step !== 3 && (
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400">
                            <span className={step === 1 ? 'text-primary font-black' : 'text-green-600'}>1. Date & Time</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className={step === 2 ? 'text-primary font-black' : ''}>2. Location & Notes</span>
                        </div>
                    )}

                    {/* Body */}
                    <div className="p-6 flex-1 overflow-y-auto">
                        
                        {/* Step 1: Date & Time Picker */}
                        {step === 1 && (
                            <div className="space-y-5">
                                {/* Worker Mini-Card */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex items-center space-x-3.5">
                                    <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
                                        {labour.username?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-800 text-sm">{labour.username}</h4>
                                        <p className="text-xs text-slate-500 font-medium">{labour.profession} • ₹{labour.rate}/hr</p>
                                    </div>
                                </div>

                                {/* Date Select */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-3 text-slate-400 w-5 h-5 pointer-events-none" />
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                            className="w-full bg-slate-50 pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-semibold text-slate-800"
                                        />
                                    </div>
                                </div>

                                {/* Time Slot Select */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Time</label>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {timeSlots.map(slot => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setBookingData({ ...bookingData, timeSlot: slot })}
                                                className={`py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${bookingData.timeSlot === slot ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{slot}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Hours & Total Panel */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hours Needed</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            required
                                            value={bookingData.hours}
                                            onChange={(e) => setBookingData({ ...bookingData, hours: Number(e.target.value) })}
                                            className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-bold text-slate-800"
                                        />
                                    </div>
                                    <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100 flex flex-col justify-center items-center">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Est. Cost</span>
                                        <span className="text-xl font-black text-primary mt-1">₹{totalPrice}</span>
                                    </div>
                                </div>

                                {/* Next Action Button */}
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 text-sm mt-6 cursor-pointer"
                                >
                                    <span>Continue to Details</span>
                                    <ChevronRight className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        )}

                        {/* Step 2: Location & Address Details */}
                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Address Input */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Work Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter complete address details"
                                            value={bookingData.location}
                                            onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                                            className="w-full bg-slate-50 pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-semibold text-slate-800"
                                        />
                                    </div>
                                </div>

                                {/* Special Notes Input */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Special Notes (Optional)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Describe the job issues, tool details, etc."
                                        value={bookingData.notes}
                                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                        className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium text-slate-800 resize-none"
                                    ></textarea>
                                </div>

                                {/* Summary details check */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs font-bold text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Date & Time:</span>
                                        <span className="text-slate-800">{bookingData.date} @ {bookingData.timeSlot}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Duration:</span>
                                        <span className="text-slate-800">{bookingData.hours} Hours</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200/60 pt-2 text-sm text-slate-800">
                                        <span>Total Est. Cost:</span>
                                        <span className="text-primary font-black">₹{totalPrice}</span>
                                    </div>
                                </div>

                                {/* Submit Action Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 text-sm mt-6 cursor-pointer"
                                >
                                    {loading ? 'Sending Request...' : 'Confirm Booking'}
                                </button>
                            </form>
                        )}

                        {/* Step 3: Success Screen */}
                        {step === 3 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6 space-y-5"
                            >
                                <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle className="w-10 h-10 animate-bounce" />
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-xl font-black text-slate-900">Booking Successful!</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Your request was sent to <span className="font-bold text-slate-700">{labour.username}</span>. You will be notified once they accept it.
                                    </p>
                                </div>

                                {/* Confirmation Details Card */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs font-bold text-slate-600 text-left max-w-xs mx-auto">
                                    <div className="flex justify-between border-b border-slate-200/50 pb-2 mb-2 text-slate-800 text-sm">
                                        <span>Booking Ref:</span>
                                        <span className="text-primary font-black">{confNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Worker:</span>
                                        <span className="text-slate-800">{labour.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Schedule:</span>
                                        <span className="text-slate-800">{bookingData.date} @ {bookingData.timeSlot}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Cost:</span>
                                        <span className="text-primary font-black">₹{totalPrice}</span>
                                    </div>
                                </div>

                                {/* Done Action Button */}
                                <button
                                    onClick={handleDone}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm mt-6 cursor-pointer"
                                >
                                    <span>Track Booking</span>
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookingModal;
