import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Labour from "./models/Labour.js";

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
        lngOffset: 0.018,
        latOffset: 0.028
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding.");

        // Clear existing workers with seed emails to avoid duplicates
        const emails = fakeWorkers.map(w => w.email);
        await Labour.deleteMany({ email: { $in: emails } });
        console.log("Deleted old seed workers.");

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
                location: {
                    type: "Point",
                    coordinates: [defaultLng + w.lngOffset, defaultLat + w.latOffset], // [lng, lat]
                    address: "Morbi/Delhi Service Area"
                }
            };
        });

        await Labour.insertMany(hashedWorkers);
        console.log("Successfully seeded fake workers with coordinates!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedDB();
