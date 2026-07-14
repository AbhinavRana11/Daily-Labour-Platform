import mongoose from "mongoose";
import User from "./models/User.js";
import Labour from "./models/Labour.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/daily_labour");
    
    const hashedPassword = bcrypt.hashSync("password123", 10);
    
    // Update all users
    const resUsers = await User.updateMany({}, { $set: { password: hashedPassword } });
    console.log(`Updated passwords for ${resUsers.modifiedCount} users to 'password123'`);

    // Update all workers (labours)
    const resLabours = await Labour.updateMany({}, { $set: { password: hashedPassword } });
    console.log(`Updated passwords for ${resLabours.modifiedCount} workers to 'password123'`);

    process.exit(0);
};

run().catch(console.error);
