import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, Clock, DollarSign, MapPin, Check, X, 
    ArrowLeft, Navigation, FileText, User, MessageSquare, Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MapComponent from '../../components/MapComponent';
import ChatModal from '../../components/ChatModal';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRecipient, setChatRecipient] = useState(null);

    const workerLoc = { lat: 28.6139, lng: 77.2090 }; // Delhi default

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const found = res.data.find(b => b._id === id);
                setBooking(found);
            } catch (err) {
                console.error("Error loading job details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id, user, navigate]);

    const handleAccept = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${id}`, {
                status: 'accepted'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Job request accepted successfully!");
            navigate('/worker/today-jobs');
        } catch (err) {
            console.error("Error accepting request:", err);
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${id}`, {
                status: 'rejected'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Job request rejected.");
            navigate('/worker/requests');
        } catch (err) {
            console.error("Error rejecting request:", err);
        }
    };

    const handleOpenChat = () => {
        if (booking.user) {
            const ids = [user._id, booking.user._id].sort();
            const chatId = ids.join('_');
            setChatRecipient({ ...booking.user, chatId });
            setIsChatOpen(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
                <p className="text-base font-semibold">Loading request details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h3 className="text-2xl font-black">Job Request Not Found</h3>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary rounded-xl font-bold">Go Back</button>
            </div>
        );
    }

    // Leaflet marker details
    const customerCoordinates = booking.location?.coordinates 
        ? { lat: booking.location.coordinates[1], lng: booking.location.coordinates[0] }
        : { lat: 28.6250, lng: 77.2200 };

    const mockupCustomerObj = {
        _id: booking.user?._id,
        username: booking.user?.username || 'Customer Client',
        profession: 'Client location',
        location: {
            type: 'Point',
            coordinates: [customerCoordinates.lng, customerCoordinates.lat]
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white font-sans relative">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left details pane */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="border-b border-slate-750 pb-5">
                                <h2 className="text-2xl font-heading font-black tracking-tight flex items-center space-x-2">
                                    <FileText className="w-6 h-6 text-primary" />
                                    <span>Job Request Details</span>
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Request ID: {booking._id}</p>
                            </div>

                            {/* Client particulars */}
                            <div className="space-y-3.5">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Client Info</h3>
                                <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-850 flex items-center space-x-4">
                                    <div className="bg-slate-800 p-2.5 rounded-xl text-primary"><User className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-white text-base">{booking.user?.username || 'Client'}</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">{booking.user?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Job particulars */}
                            <div className="space-y-3.5">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Job Parameters</h3>
                                <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-850 space-y-3 text-xs text-slate-300 font-semibold">
                                    <div className="flex items-center text-slate-400"><MapPin className="w-4 h-4 mr-2 text-slate-500 shrink-0" /> <span className="truncate">{booking.location?.address}</span></div>
                                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-450" /> {new Date(booking.date).toLocaleDateString()}</div>
                                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-slate-450" /> {booking.hours} Hours Requested</div>
                                    <div className="flex items-center text-white font-extrabold"><DollarSign className="w-4 h-4 mr-2 text-slate-500" /> ₹{booking.totalPrice}</div>
                                </div>
                            </div>

                            {/* Notes */}
                            {booking.notes && (
                                <div className="bg-slate-900/20 p-4 rounded-2xl border border-slate-850 space-y-1.5">
                                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Customer Special Notes</h4>
                                    <p className="text-slate-300 text-xs italic leading-relaxed">"{booking.notes}"</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {booking.status === 'pending' ? (
                            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-750 mt-6">
                                <button
                                    onClick={handleAccept}
                                    className="bg-primary hover:bg-primaryDark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                                >
                                    <Check className="w-4.5 h-4.5" />
                                    <span>Accept Job</span>
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-900 text-red-400 font-bold py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                                >
                                    <X className="w-4.5 h-4.5" />
                                    <span>Reject Request</span>
                                </button>
                            </div>
                        ) : (
                            <div className="pt-6 border-t border-slate-750 mt-6 grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleOpenChat}
                                    className="py-3 bg-slate-700 hover:bg-slate-650 text-white font-bold rounded-xl border border-slate-650 transition-colors flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
                                >
                                    <MessageSquare className="w-4 h-4 text-slate-350" />
                                    <span>Chat Client</span>
                                </button>
                                <a
                                    href={`tel:${booking.user?.phone || '9876543210'}`}
                                    className="py-3 bg-slate-700 hover:bg-slate-650 text-white font-bold rounded-xl border border-slate-650 transition-colors flex items-center justify-center space-x-1.5 text-xs"
                                >
                                    <Phone className="w-4 h-4 text-slate-350" />
                                    <span>Call Client</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Map overview pane */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl h-[400px] lg:h-auto min-h-[350px]">
                        <MapComponent 
                            labours={[mockupCustomerObj]} 
                            customerLoc={workerLoc} 
                            selectedLabour={mockupCustomerObj}
                            searchRadius={5}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipient={chatRecipient}
                booking={booking}
            />
        </div>
    );
};

export default JobDetails;
