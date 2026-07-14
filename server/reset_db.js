import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Labour from "./models/Labour.js";
import User from "./models/User.js";
import Booking from "./models/Booking.js";
import Chat from "./models/Chat.js";
import Message from "./models/Message.js";
import Review from "./models/Review.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/daily_labour";

const fakeWorkers = [
    {
        username: "Rahul Kumar",
        email: "rahul@example.com",
        password: "password123",
        phone: "9876543210",
        profession: "Electrician",
        experience: 5,
        rate: 350,
        bio: "Expert electrician with 5+ years of experience in residential wiring, short circuit fixes, and smart appliance installation.",
        rating: 4.9,
        isAvailable: true,
        skills: ["Home Wiring", "Short Circuit Repair", "Smart Switches", "Inverter Setup", "Emergency Safety Fixes"],
        certificates: ["National Electrical Safety Diploma", "Licensed Wireman Certificate"],
        portfolio: [
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300", 
            "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=300"
        ],
        lngOffset: -0.015,
        latOffset: 0.012
    },
    {
        username: "Amit Sharma",
        email: "amit@example.com",
        password: "password123",
        phone: "9876543211",
        profession: "Plumber",
        experience: 7,
        rate: 280,
        bio: "Specialist plumber offering water pump repairs, pipe leaks restoration, and bathroom sanitary fitting installs.",
        rating: 4.8,
        isAvailable: true,
        skills: ["Leak Detection", "Water Pump Repair", "Bathroom Fittings", "Drainage Cleansing"],
        certificates: ["Certified Guild Plumber", "Hydraulics Safety Standard"],
        portfolio: [
            "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=300"
        ],
        lngOffset: 0.011,
        latOffset: -0.008
    },
    {
        username: "Rakesh Singh",
        email: "rakesh@example.com",
        password: "password123",
        phone: "9876543212",
        profession: "Mason",
        experience: 6,
        rate: 450,
        bio: "Experienced mason skilled in brickwork, plastering, wall construction, tiles laying, and house renovative building.",
        rating: 4.7,
        isAvailable: false,
        skills: ["Bricklaying", "Wall Plastering", "Tiling", "Foundation Concrete"],
        certificates: ["Master Mason Certification", "Concrete Guild Diploma"],
        portfolio: [
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=300"
        ],
        lngOffset: 0.025,
        latOffset: 0.015
    },
    {
        username: "Vikram Rathore",
        email: "vikram@example.com",
        password: "password123",
        phone: "9876543213",
        profession: "Carpenter",
        experience: 4,
        rate: 300,
        bio: "Professional carpenter expert in modular kitchen setups, furniture assembly, doors repair, and structural woodwork.",
        rating: 4.5,
        isAvailable: true,
        skills: ["Modular Kitchens", "Furniture Assembly", "Door Repair", "Locks Installation"],
        certificates: ["Woodwork Design Diploma"],
        portfolio: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300"
        ],
        lngOffset: -0.022,
        latOffset: -0.019
    },
    {
        username: "Sunita Devi",
        email: "sunita@example.com",
        password: "password123",
        phone: "9876543214",
        profession: "Housekeeper",
        experience: 3,
        rate: 200,
        bio: "Reliable cleaner/housekeeper offering deep cleaning, office sanitization, dusting, and home organization.",
        rating: 4.6,
        isAvailable: true,
        skills: ["Deep Cleaning", "Sanitization", "Dusting", "Office Cleaning"],
        certificates: ["All India Sanitization Certified"],
        portfolio: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300"
        ],
        lngOffset: -0.005,
        latOffset: 0.022
    },
    {
        username: "Vijay Malhotra",
        email: "vijay@example.com",
        password: "password123",
        phone: "9876543215",
        profession: "Painter",
        experience: 8,
        rate: 320,
        bio: "Creative painter specialized in wall textures, exterior weatherproof coating, and decorative interior designing.",
        rating: 4.9,
        isAvailable: true,
        skills: ["Wall Textures", "Exterior Coating", "Decorative Stencils", "Wallpaper Mounting"],
        certificates: ["Professional Wall Decorator Certification"],
        portfolio: [
            "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=300"
        ],
        lngOffset: 0.018,
        latOffset: 0.028
    }
];

const resetDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for database reset.");

        // Drop the collections to delete index errors and old corrupt records
        try {
            await Labour.collection.drop();
            console.log("Dropped labours collection.");
        } catch (e) {
            console.log("Labours collection didn't exist or couldn't drop.");
        }

        try {
            await Booking.collection.drop();
            console.log("Dropped bookings collection.");
        } catch (e) {
            console.log("Bookings collection didn't exist or couldn't drop.");
        }

        try {
            await Chat.collection.drop();
            console.log("Dropped chats collection.");
        } catch (e) {
            console.log("Chats collection didn't exist or couldn't drop.");
        }

        try {
            await Message.collection.drop();
            console.log("Dropped messages collection.");
        } catch (e) {
            console.log("Messages collection didn't exist or couldn't drop.");
        }

        try {
            await Review.collection.drop();
            console.log("Dropped reviews collection.");
        } catch (e) {
            console.log("Reviews collection didn't exist or couldn't drop.");
        }

        // New Delhi default center
        const defaultLng = 77.2090;
        const defaultLat = 28.6139;

        const hashedWorkers = fakeWorkers.map(w => {
            const hashedPassword = bcrypt.hashSync(w.password, 10);
            return {
                username: w.username,
                email: w.email,
                password: hashedPassword,
                phone: w.phone,
                profession: w.profession,
                experience: w.experience,
                rate: w.rate,
                bio: w.bio,
                rating: w.rating,
                isAvailable: w.isAvailable,
                skills: w.skills,
                certificates: w.certificates,
                portfolio: w.portfolio,
                location: {
                    type: "Point",
                    coordinates: [defaultLng + w.lngOffset, defaultLat + w.latOffset],
                    address: "Delhi Service Area"
                }
            };
        });

        // Insert and build indexes
        await Labour.insertMany(hashedWorkers);
        console.log("Inserted clean mock workers.");

        // Build 2dsphere index explicitly
        await Labour.collection.createIndex({ location: "2dsphere" });
        console.log("Successfully built 2dsphere index on labours location field!");

        mongoose.connection.close();
        console.log("Database reset complete!");
    } catch (error) {
        console.error("Database reset failed:", error);
        process.exit(1);
    }
};

resetDB();
