import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search, MapPin, Calendar, Clock, CheckCircle, XCircle,
    AlertCircle, DollarSign, User as UserIcon, Briefcase,
    Settings, LogOut, Phone, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import LabourCard from '../components/LabourCard';
import BookingModal from '../components/BookingModal'; // Import Modal
import ChatModal from '../components/ChatModal';

const Dashboard = () => {
    const { user, logout, socket } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');

    // Modal State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedLabour, setSelectedLabour] = useState(null);
    const [chatRecipient, setChatRecipient] = useState(null);

    // Data State
    const [bookings, setBookings] = useState([]);
    const [labours, setLabours] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    // Fetch Bookings & Labours
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');

                // Fetch Bookings
                const bookingsRes = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(bookingsRes.data);

                // Fetch Recommended Labours
                const laboursRes = await axios.get('http://localhost:5000/api/auth/labours');
                setLabours(laboursRes.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoadingBookings(false);
            }
        };

        fetchData();

        // Listen for real-time updates
        if (socket) {
            socket.on('booking_status_update', (updatedBooking) => {
                // Update the specific booking in the list
                setBookings(prev => (prev || []).map(b => b._id === updatedBooking._id ? updatedBooking : b));
            });

            return () => socket.off('booking_status_update');
        }

    }, [user, isBookingModalOpen]); // Refresh when modal closes (heuristic for new booking)

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p>Please log in to view dashboard.</p>
                <button onClick={() => navigate('/login')} className="ml-4 text-primary underline">Login</button>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleOpenBooking = (labour) => {
        setSelectedLabour(labour);
        setIsBookingModalOpen(true);
    };

    const handleOpenChat = (recipient) => {
        setChatRecipient(recipient);
        setIsChatModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">
                        Welcome back, <span className="text-primary">{user.username}</span>!
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {user.role === 'labour' ? 'Manage your work and requests.' : 'Find and manage your labour bookings.'}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </button>
            </div>

            {user.role === 'user' ? (
                <UserDashboardView
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    navigate={navigate}
                    bookings={bookings}
                    labours={labours} // Pass real labours
                    onBook={handleOpenBooking}
                    onChat={handleOpenChat}
                    loading={loadingBookings}
                />
            ) : (
                <LabourDashboardView
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    bookings={bookings}
                    loading={loadingBookings}
                    onChat={handleOpenChat}
                />
            )}

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                labour={selectedLabour}
            />

            {/* Chat Modal */}
            <ChatModal
                isOpen={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
                recipient={chatRecipient}
            />
        </div>
    );
};

// ==========================================
// USER DASHBOARD COMPONENT
// ==========================================
import MapComponent from '../components/MapComponent';

const UserDashboardView = ({ activeTab, setActiveTab, navigate, bookings, labours, onBook, onChat, loading }) => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

    // Filter Labours (Simple recommendation logic: just first 3 for now)
    const recentLabours = labours; // Show ALL labours in map, maybe slice for list

    // Fallback if no labours found (prevent empty section if DB empty)
    const displayLabours = recentLabours.length > 0 ? recentLabours : [
        // Keep one dummy just in case to show UI structure, but ideally fetch fail handles this. 
        // For now, if empty, we just show empty or "No labours found".
    ];

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'active') return b.status === 'accepted';
        if (activeTab === 'pending') return b.status === 'pending';
        if (activeTab === 'history') return b.status === 'completed' || b.status === 'rejected';
        return true;
    });

    return (
        <div className="grid grid-cols-1 gap-8">

            {/* 1. Search & Recommendation Section (NEW) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Find & Book Labour</h2>

                    {/* View Toggle */}
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Map View 🗺️
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by profession (e.g. Plumber) or location..."
                            className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/find-labour')}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primaryDark transition-colors shadow-lg shadow-orange-200"
                    >
                        Search
                    </button>
                </div>

                {/* Content Area: Map or List */}
                <div>
                    {viewMode === 'map' ? (
                        <div className="animate-fade-in">
                            <MapComponent labours={labours} onBook={onBook} />
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700">Recommended Near You</h3>
                                <button onClick={() => navigate('/find-labour')} className="text-sm text-primary font-medium hover:underline">View All</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recentLabours.length > 0 ? recentLabours.slice(0, 3).map(labour => (
                                    <LabourCard key={labour._id} labour={labour} onBook={onBook} />
                                )) : (
                                    <p className="text-gray-400 col-span-3 text-center py-4">No recommended labours found yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Bookings Section */}
            <div>
                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 w-fit">
                    {['active', 'pending', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-orange-100 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-xl text-gray-800 capitalize">{activeTab} Bookings</h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-10 text-center text-gray-400">Loading...</div>
                        ) : filteredBookings.length > 0 ? filteredBookings.map(item => (
                            <div key={item._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-start space-x-4 mb-4 md:mb-0">
                                    <div className="mt-1">
                                        <div className="bg-blue-50 p-2 rounded-lg text-secondary">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.labour?.username || 'Unknown Labour'}</h4>
                                        <p className="text-gray-600 text-sm flex items-center mt-1">
                                            <Briefcase className="w-3 h-3 mr-1" /> {item.labour?.profession || 'Professional'}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(item.date).toLocaleDateString()}</span>
                                            <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1" /> ₹{item.totalPrice}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                        ${item.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'}`}>
                                        {item.status}
                                    </span>
                                    {item.status === 'accepted' && (
                                        <div className="mt-3 flex items-center space-x-2">
                                            <button className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-md shadow-sm hover:bg-green-700 flex items-center justify-center">
                                                <Phone className="w-3 h-3 mr-1" /> Call
                                            </button>
                                            <button
                                                onClick={() => onChat(item.labour)}
                                                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md shadow-sm hover:bg-blue-700 flex items-center justify-center"
                                            >
                                                <MessageSquare className="w-3 h-3 mr-1" /> Chat
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="p-10 text-center text-gray-400">
                                <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <p>No {activeTab} bookings found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// LABOUR DASHBOARD COMPONENT
// ==========================================
const LabourDashboardView = ({ activeTab, setActiveTab, bookings, loading, onChat }) => {
    const [isAvailable, setIsAvailable] = useState(true);

    const pendingRequests = bookings.filter(b => b.status === 'pending');
    const acceptedJobs = bookings.filter(b => b.status === 'accepted');

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.reload(); // Quick refresh to show updates
        } catch (error) {
            alert('Error updating status');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile & Status Card */}
            <div className="lg:col-span-1 space-y-6">
                {/* Availability Toggle */}
                <div className={`p-6 rounded-2xl shadow-sm border ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <h3 className="font-bold text-gray-800 mb-2">Work Status</h3>
                    <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                            {isAvailable ? 'Available for Jobs' : 'Not Taking Jobs'}
                        </span>
                        <button
                            onClick={() => setIsAvailable(!isAvailable)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Earnings Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Earnings</h3>
                    <div className="flex items-end">
                        <span className="text-4xl font-extrabold text-secondary">₹12,450</span>
                        <span className="text-green-500 text-sm font-bold mb-1 ml-2">+15% 📈</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
                {/* Section: New Requests */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-secondary flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                            New Job Requests
                        </h2>
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">{pendingRequests.length}</span>
                    </div>

                    <div className="grid gap-4">
                        {loading ? <p>Loading...</p> : pendingRequests.length > 0 ? pendingRequests.map(req => (
                            <div key={req._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-l-primary flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-800">{req.user?.username}</h4>
                                    <p className="text-gray-500 text-sm flex items-center mt-1">
                                        <MapPin className="w-3 h-3 mr-1" /> {req.location?.address}
                                    </p>
                                    <div className="flex space-x-4 mt-2 text-sm">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">{req.hours} Hours</span>
                                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-medium">₹{req.totalPrice}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 italic">"{req.notes}"</p>
                                </div>
                                <div className="flex space-x-3 mt-4 md:mt-0 w-full md:w-auto">
                                    <button
                                        onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                        className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(req._id, 'accepted')}
                                        className="flex-1 md:flex-none px-6 py-2 bg-secondary text-white font-semibold rounded-lg shadow-lg hover:bg-secondaryLight"
                                    >
                                        Accept Job
                                    </button>
                                </div>
                            </div>
                        )) : <p className="text-gray-400 italic">No new requests.</p>}
                    </div>
                </section>

                {/* Section: Upcoming Jobs */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Upcoming Accepted Jobs</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {acceptedJobs.length > 0 ? acceptedJobs.map(job => (
                            <div key={job._id} className="p-5 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{job.user?.username}</h4>
                                        <p className="text-xs text-gray-500">{new Date(job.date).toLocaleDateString()} • {job.location?.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-green-500 hover:text-white transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onChat(job.user)}
                                        className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="p-6 text-gray-400 text-center">No upcoming jobs.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
