import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const LabourCard = ({ labour, onBook }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-md p-4 flex gap-4 border border-gray-100 transition-all hover:shadow-lg"
        >
            <img
                src={labour.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                alt={labour.name}
                className="w-24 h-24 rounded-lg object-cover bg-gray-200"
            />

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-secondary">{labour.username || labour.name}</h3>
                        <p className="text-primary font-medium text-sm">{labour.profession}</p>
                    </div>
                    <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-gray-600 text-sm ml-1">{labour.rating}</span>
                    </div>
                </div>

                <div className="mt-2 space-y-1">
                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {labour.distance} km away
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {labour.exp} exp
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-secondary">₹{labour.rate}<span className="text-sm font-normal text-gray-500">/hr</span></span>
                    <button
                        onClick={() => onBook(labour)}
                        className="bg-secondary text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-secondaryLight transition-colors"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default LabourCard;
