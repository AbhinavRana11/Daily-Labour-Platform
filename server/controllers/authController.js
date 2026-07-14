import User from "../models/User.js";
import Labour from "../models/Labour.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret_key_123", {
        expiresIn: "30d",
    });
};

export const register = async (req, res) => {
    const { role, username, email, password, phone, ...otherData } = req.body;

    try {
        // 1. Check if user exists
        const Model = role === "labour" ? Labour : User;
        const existingUser = await Model.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User/Labour
        const newUser = new Model({
            username,
            email,
            password: hashedPassword,
            phone,
            ...otherData, // Profession, rate, etc. for Labour
        });

        await newUser.save();

        // 4. Return Token
        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role, // actual role from DB (customer or labour)
            token: generateToken(newUser._id, newUser.role),
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const Model = role === "labour" ? Labour : User;
        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role, // actual role from DB (customer or labour)
            token: generateToken(user._id, user.role),
            // Return extra fields if labour
            ...(role === "labour" && { profession: user.profession, rate: user.rate }),
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getLabours = async (req, res) => {
    const { lat, lng, radius } = req.query;

    try {
        let query = {};
        if (lat && lng) {
            const maxDistance = (Number(radius) || 5) * 1000; // default 5km in meters
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(lng), Number(lat)]
                    },
                    $maxDistance: maxDistance
                }
            };

            // Check if any workers exist near this location
            let labours = await Labour.find(query, '-password');

            if (labours.length === 0) {
                console.log("No workers nearby. Dynamically shifting seed workers to center coordinates:", lat, lng);
                
                const offsets = [
                    { email: "rahul@example.com", lng: -0.015, lat: 0.012 },
                    { email: "amit@example.com", lng: 0.011, lat: -0.008 },
                    { email: "rakesh@example.com", lng: 0.025, lat: 0.015 },
                    { email: "vikram@example.com", lng: -0.022, lat: -0.019 },
                    { email: "sunita@example.com", lng: -0.005, lat: 0.022 },
                    { email: "vijay@example.com", lng: 0.018, lat: 0.028 }
                ];

                const centerLng = Number(lng);
                const centerLat = Number(lat);

                for (const off of offsets) {
                    await Labour.updateOne(
                        { email: off.email },
                        {
                            $set: {
                                location: {
                                    type: "Point",
                                    coordinates: [centerLng + off.lng, centerLat + off.lat],
                                    address: "Dynamic Mock Service Area"
                                }
                            }
                        }
                    );
                }

                // Query again now that positions have been shifted
                labours = await Labour.find(query, '-password');
            }

            return res.json(labours);
        }

        const labours = await Labour.find(query, '-password');
        res.json(labours);
    } catch (error) {
        console.error("Get Labours Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateLocation = async (req, res) => {
    const { id, latitude, longitude, address } = req.body;

    try {
        const labour = await Labour.findById(id);
        if (!labour) {
            return res.status(404).json({ message: "Labour not found" });
        }

        labour.location = {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            address: address || labour.location?.address
        };

        await labour.save();
        res.json({ message: "Location updated successfully", location: labour.location });
    } catch (error) {
        console.error("Update Location Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const { username, phone, profession, rate, bio, experience } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    try {
        const Model = role === "labour" ? Labour : User;
        const user = await Model.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username) user.username = username;
        if (phone) user.phone = phone;

        if (role === "labour") {
            if (profession) user.profession = profession;
            if (rate !== undefined) user.rate = Number(rate);
            if (bio !== undefined) user.bio = bio;
            if (experience !== undefined) user.experience = Number(experience);
        }

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: role,
            phone: user.phone,
            ...(role === "labour" && {
                profession: user.profession,
                rate: user.rate,
                bio: user.bio,
                experience: user.experience
            })
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const labour = await Labour.findById(req.user.id);
        if (!labour) return res.status(404).json({ message: "Labour not found" });

        labour.isAvailable = isAvailable;
        await labour.save();
        res.json({ message: "Availability updated successfully", isAvailable: labour.isAvailable });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const updatePrice = async (req, res) => {
    try {
        const { rate } = req.body;
        const labour = await Labour.findById(req.user.id);
        if (!labour) return res.status(404).json({ message: "Labour not found" });

        labour.rate = Number(rate);
        await labour.save();
        res.json({ message: "Rate updated successfully", rate: labour.rate });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const updateRadius = async (req, res) => {
    try {
        const { serviceRadius } = req.body;
        const labour = await Labour.findById(req.user.id);
        if (!labour) return res.status(404).json({ message: "Labour not found" });

        labour.serviceRadius = Number(serviceRadius);
        await labour.save();
        res.json({ message: "Service radius updated successfully", serviceRadius: labour.serviceRadius });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getLabourById = async (req, res) => {
    try {
        const labour = await Labour.findById(req.params.id, '-password');
        if (!labour) return res.status(404).json({ message: "Labour not found" });
        res.json(labour);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const User = (await import("../models/User.js")).default;
        const users = await User.find({ role: 'customer' }, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const User = (await import("../models/User.js")).default;
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const deleteLabour = async (req, res) => {
    try {
        const Labour = (await import("../models/Labour.js")).default;
        await Labour.findByIdAndDelete(req.params.id);
        res.json({ message: "Labour deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
