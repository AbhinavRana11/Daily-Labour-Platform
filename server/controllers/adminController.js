import User from '../models/User.js';
import Booking from '../models/Booking.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllWorkers = async (req, res) => {
    try {
        const workers = await User.find({ role: 'labour' }).select('-password');
        res.json(workers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'username email phone')
            .populate('labour', 'username email profession phone');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
