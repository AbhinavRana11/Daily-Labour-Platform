import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, Calendar, Clock, DollarSign, MapPin, 
    FileText, User, ShieldCheck, Mail, Phone, MessageSquare,
    Printer, Share2, Download, Trash2, Map
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RatingModal from '../../components/RatingModal';
import ChatModal from '../../components/ChatModal';

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

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBookingDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBooking(res.data);
            } catch (err) {
                console.error("Error fetching booking details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBookingDetails();
        }
    }, [id, user, navigate]);

    const handleCancelBooking = async () => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/bookings/cancel/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooking(res.data);
            alert("Booking cancelled successfully.");
        } catch (err) {
            console.error("Error cancelling booking:", err);
            alert("Failed to cancel booking. Please try again.");
        }
    };

    const handleOpenChat = () => {
        if (booking.labour) {
            const ids = [user._id, booking.labour._id].sort();
            const chatId = ids.join('_');
            setChatRecipient({ ...booking.labour, chatId });
            setIsChatOpen(true);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'DailyLabour Invoice',
                text: `Invoice details for booking ${booking.bookingId || booking._id}`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert(`Invoice link copied to clipboard: ${window.location.href}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
                <p className="text-base font-semibold animate-pulse">Loading booking invoice details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h3 className="text-2xl font-black">Booking Not Found</h3>
                <p className="text-slate-400">We could not load the specific booking receipt details.</p>
                <button onClick={() => navigate('/customer/bookings')} className="px-6 py-2.5 bg-primary rounded-xl font-bold">Back to Bookings</button>
            </div>
        );
    }

    const avatar = getAvatarUrl(booking.labour?.username || 'Labour');
    const hourlyRate = booking.labour?.rate || Math.round(booking.totalPrice / booking.hours);
    const platformFee = 50;
    const taxes = Math.round(booking.totalPrice * 0.18);
    const grossTotal = booking.totalPrice + platformFee + taxes;

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/customer/bookings')}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Back to Bookings</span>
                </button>

                {/* Main Card */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-750 pb-6 gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-heading font-black tracking-tight flex items-center space-x-2">
                                <FileText className="w-6 h-6 text-primary animate-pulse" />
                                <span>Booking Details</span>
                            </h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                Booking ID: {booking.bookingId || `#BK${booking._id.slice(-4).toUpperCase()}`}
                            </p>
                        </div>
                        <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border capitalize ${
                            booking.status === 'completed' 
                                ? 'bg-green-950/45 border-green-800 text-green-400' 
                                : ['cancelled', 'rejected'].includes(booking.status)
                                    ? 'bg-red-950/45 border-red-900 text-red-400'
                                    : 'bg-yellow-950/45 border-yellow-800 text-yellow-450'
                        }`}>
                            🟢 {booking.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Booking metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Left Column: Worker info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Worker Assigned</h3>
                            
                            <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-850 flex items-center space-x-4">
                                <img src={avatar} alt="" className="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-slate-750" />
                                <div>
                                    <h4 className="font-bold text-white text-base flex items-center gap-1">
                                        <span>{booking.labour?.username}</span>
                                        <ShieldCheck className="w-4 h-4 text-green-400" />
                                    </h4>
                                    <p className="text-primary font-bold text-xs uppercase tracking-wider mt-1">{booking.labour?.profession}</p>
                                    <p className="text-xs text-slate-450 mt-1 font-semibold">Phone: {booking.labour?.phone || 'XXXXXXXXXX'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Particulars */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Booking Details</h3>
                            <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-850 space-y-3 text-xs font-bold text-slate-300">
                                <div className="flex justify-between">
                                    <span className="text-slate-450">Booking Date</span>
                                    <span>{new Date(booking.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-450">Time Slot</span>
                                    <span>{booking.scheduledTime || '2 PM'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-450">Estimated Cost</span>
                                    <span className="text-primary font-extrabold">₹{booking.totalPrice || 600}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-450">Payment Status</span>
                                    <span className={booking.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-450'}>
                                        {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Booking notes / Address */}
                    <div className="bg-slate-900/20 p-5 rounded-2xl border border-slate-850 space-y-3.5 text-xs">
                        <div>
                            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Service Address</p>
                            <p className="text-slate-200 mt-1 font-semibold">{booking.customerAddress || 'Delhi Area'}</p>
                        </div>
                        {booking.notes && (
                            <div>
                                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Special Instructions</p>
                                <p className="text-slate-350 italic mt-1">"{booking.notes}"</p>
                            </div>
                        )}
                    </div>

                    {/* Active Booking Controls */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 bg-slate-900/10 p-4 rounded-2xl border border-slate-850/60">
                        {['pending', 'accepted', 'started', 'working', 'on_the_way', 'arrived'].includes(booking.status) ? (
                            <Link
                                to={`/customer/track/${booking._id}`}
                                className="py-3 bg-gradient-to-r from-primary to-orange-500 hover:from-primaryDark hover:to-orange-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow"
                            >
                                <Map className="w-3.5 h-3.5" />
                                <span>Track Worker</span>
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="py-3 bg-slate-800 text-slate-500 font-bold rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
                            >
                                <Map className="w-3.5 h-3.5" />
                                <span>Track Unavailable</span>
                            </button>
                        )}
                        <a
                            href={`tel:${booking.labour?.phone || '9876543210'}`}
                            className="py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 border border-slate-700"
                        >
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            <span>Call</span>
                        </a>
                        <button
                            onClick={handleOpenChat}
                            className="py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 border border-slate-700"
                        >
                            <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            <span>Chat</span>
                        </button>
                        {['pending', 'accepted'].includes(booking.status) ? (
                            <button
                                onClick={handleCancelBooking}
                                className="py-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-bold rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 border border-red-900/30 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Cancel Booking</span>
                            </button>
                        ) : (
                            <button
                                disabled
                                className="py-3 bg-slate-850 text-slate-600 font-bold rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 border border-slate-800"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Cancel Locked</span>
                            </button>
                        )}
                    </div>

                    {/* Invoice Cost Breakdown & Invoice Actions */}
                    <div className="space-y-4 border-t border-slate-750 pt-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Payment & Invoices</h3>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={handlePrint}
                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                                    title="Print Invoice"
                                >
                                    <Printer className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={handleShare}
                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                                    title="Share Invoice"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => alert("Mock Invoice Download triggered.")}
                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                                    title="Download Invoice"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-5 space-y-3 text-xs text-slate-350 font-semibold">
                            <div className="flex justify-between">
                                <span>Estimated Cost</span>
                                <span>₹{booking.estimatedPrice || booking.totalPrice || 600}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Final Cost</span>
                                <span className="text-white font-extrabold">₹{booking.finalPrice || booking.totalPrice || 580}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Taxes (18% GST)</span>
                                <span>₹{taxes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Booking Fee</span>
                                <span>₹{platformFee}</span>
                            </div>
                            <hr className="border-slate-800" />
                            <div className="flex justify-between text-sm font-heading font-black text-white">
                                <span>Total Paid Amount</span>
                                <span className="text-primary">₹{grossTotal}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            <RatingModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                booking={booking}
                onReviewSubmitted={() => {
                    setIsReviewOpen(false);
                    window.location.reload();
                }}
            />

            <ChatModal 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                recipient={chatRecipient} 
                booking={booking}
            />
        </div>
    );
};

export default BookingDetails;
