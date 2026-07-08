import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import LabourCard from '../components/LabourCard';
import BookingModal from '../components/BookingModal';
import { Search, Filter } from 'lucide-react';

import axios from 'axios';

const FindLabour = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfession, setSelectedProfession] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingLabour, setBookingLabour] = useState(null);
    const [labours, setLabours] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Labours from API
    useEffect(() => {
        const fetchLabours = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/labours');
                setLabours(res.data);
            } catch (error) {
                console.error("Error fetching labours:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLabours();
    }, []);

    const filteredLabourers = labours.filter(l =>
        (selectedProfession === 'All' || (l.profession && l.profession === selectedProfession)) &&
        ((l.username && l.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (l.profession && l.profession.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const handleBook = (labour) => {
        setBookingLabour(labour);
        setIsModalOpen(true);
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar - List */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white p-4 overflow-y-auto shadow-xl z-10 flex flex-col h-full border-r border-gray-200">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary mb-4">Find Labour</h1>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search name or profession..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['All', 'Plumber', 'Electrician', 'Carpenter', 'Housekeeper'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedProfession(cat)}
                                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${selectedProfession === cat ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{filteredLabourers.length} Labours Nearby</h2>
                    {filteredLabourers && filteredLabourers.map(labour => (
                        <LabourCard key={labour._id} labour={labour} onBook={handleBook} />
                    ))}
                    {(!filteredLabourers || filteredLabourers.length === 0) && (
                        <div className="text-center text-gray-400 mt-10">No labourers found.</div>
                    )}
                </div>
            </div>

            {/* Map View */}
            <div className="w-full md:w-2/3 lg:w-3/4 h-full relative">
                <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-md hidden md:block">
                    <p className="text-xs font-bold text-gray-500">📍 Showing Nearby Workers</p>
                </div>
                <MapComponent labours={filteredLabourers} onBook={handleBook} />
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                labour={bookingLabour}
            />
        </div>
    );
};

export default FindLabour;
