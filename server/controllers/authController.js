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
            role: role,
            token: generateToken(newUser._id, role),
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
            role: role, // 'user' or 'labour'
            token: generateToken(user._id, role),
            // Return extra fields if labour
            ...(role === "labour" && { profession: user.profession, rate: user.rate }),
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getLabours = async (req, res) => {
    try {
        const labours = await Labour.find({}, '-password'); // Exclude password
        res.json(labours);
    } catch (error) {
        console.error("Get Labours Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
