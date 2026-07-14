import React, { useState } from 'react';
import { X, Star, Camera, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const RatingModal = ({ isOpen, onClose, booking, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [images, setImages] = useState([]);
    
    if (!isOpen || !booking) return null;

    const worker = booking.labour;
    const workerName = worker?.username || 'Worker';

    const handleFakeImageUpload = () => {
        const fakeImages = [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300", // cleaning
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=300", // construction
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300"  // plumbing
        ];
        const randomImg = fakeImages[Math.floor(Math.random() * fakeImages.length)];
        if (!images.includes(randomImg)) {
            setImages(prev => [...prev, randomImg]);
        }
    };

    const handleRemoveImage = (imgUrl) => {
        setImages(prev => prev.filter(img => img !== imgUrl));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                bookingId: booking._id,
                workerId: worker._id || worker.id,
                rating: Number(rating),
                review: reviewText,
                images: images
            };

            await axios.post('http://localhost:5000/api/reviews', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Review submitted successfully! Thank you for your feedback.");
            if (onReviewSubmitted) onReviewSubmitted();
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            alert(`Failed to submit review: ${message}`);
        } finally {
            setLoading(false);
        }
    };

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
                        <h3 className="font-heading font-black text-base">Rate Service</h3>
                        <button onClick={onClose} className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto max-h-[75vh]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h4 className="font-heading font-black text-slate-800 text-lg">How was your experience?</h4>
                                <p className="text-slate-500 text-sm">
                                    Rate your booking with <span className="font-bold text-slate-700">{workerName}</span> ({worker?.profession}).
                                </p>
                            </div>

                            {/* Stars Select */}
                            <div className="flex justify-center items-center space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = hoverRating ? star <= hoverRating : star <= rating;
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="text-amber-400 focus:outline-none transition-transform hover:scale-115 active:scale-95"
                                        >
                                            <Star 
                                                className={`w-10 h-10 ${isActive ? 'fill-current' : 'text-slate-200'}`} 
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Review Textarea */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Write Review</label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="Tell us about the worker's performance, behavior, punctuality, and tools..."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    className="w-full bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium text-slate-800 resize-none"
                                ></textarea>
                            </div>

                            {/* Work Photos Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Upload Work Photos</label>
                                <div className="flex flex-wrap gap-2.5 items-center">
                                    <button
                                        type="button"
                                        onClick={handleFakeImageUpload}
                                        className="w-16 h-16 bg-slate-55 rounded-2xl border border-slate-200 border-dashed hover:bg-slate-100 flex flex-col items-center justify-center text-slate-455 transition-colors cursor-pointer"
                                        title="Attach Work Photo"
                                    >
                                        <Camera className="w-5 h-5 text-slate-500" />
                                        <span className="text-[9px] font-bold mt-1 uppercase text-slate-400">Add Photo</span>
                                    </button>

                                    {/* Uploaded Thumbnails */}
                                    {images.map((imgUrl, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 group shadow-sm">
                                            <img src={imgUrl} alt="Upload preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(imgUrl)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center text-sm cursor-pointer"
                            >
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RatingModal;
