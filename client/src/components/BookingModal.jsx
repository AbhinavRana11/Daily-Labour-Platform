import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ isOpen, onClose, labour }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [bookingData, setBookingData] = useState({
        date: '',
        hours: 4, // Default hours
        location: user?.address?.city || '',
        notes: ''
    });

    if (!isOpen || !labour) return null;

    const totalPrice = bookingData.hours * labour.rate;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                labourId: labour._id || labour.id, // Handle both potential ID formats
                date: bookingData.date,
                hours: Number(bookingData.hours),
                totalPrice: totalPrice,
                location: { address: bookingData.location },
                notes: bookingData.notes
            };

            await axios.post('http://localhost:5000/api/bookings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Show success (could be a toast)
            alert('Booking Request Sent Successfully!');
            onClose();
            // Ideally trigger refresh of bookings list in parent
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            if (error.response?.status === 401) {
                alert("Session expired. Please Logout and Login again.");
                // Optional: window.location.href = '/login'; or use auth.logout() if available
            } else {
                alert(`Failed to create booking: ${message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-secondary p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold text-lg">Book Labour</h3>
                        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
                            <img
                                src={labour.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                alt={labour.name || labour.username}
                                className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                            />
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg">{labour.name || labour.username}</h4>
                                <p className="text-primary font-medium">{labour.profession}</p>
                                <p className="text-sm text-gray-500">Rate: ₹{labour.rate}/hr</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        required
                                        value={bookingData.date}
                                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                        className="input-field w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours Needed</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            required
                                            value={bookingData.hours}
                                            onChange={(e) => setBookingData({ ...bookingData, hours: e.target.value })}
                                            className="input-field w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex flex-col justify-center items-center">
                                    <span className="text-xs text-gray-500 uppercase font-bold">Total Cost</span>
                                    <span className="text-xl font-bold text-primary">₹{totalPrice}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter address"
                                        value={bookingData.location}
                                        onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                                        className="input-field w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                                <textarea
                                    rows="2"
                                    placeholder="Briefly describe the work..."
                                    value={bookingData.notes}
                                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                    className="input-field w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-secondary text-white rounded-xl font-bold shadow-lg hover:bg-secondaryLight transition-all mt-4 flex justify-center items-center"
                            >
                                {loading ? 'Sending Request...' : 'Confirm Booking Request'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookingModal;
