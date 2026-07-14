import mongoose from "mongoose";
import User from "./models/User.js";
import Labour from "./models/Labour.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/daily_labour");
    const users = await User.find({});
    const labours = await Labour.find({});
    console.log("USERS IN DB:");
    users.forEach(u => console.log(`- ${u.username} (${u.email}) Role: ${u.role}`));
    console.log("LABOURS IN DB:");
    labours.forEach(l => console.log(`- ${l.username} (${l.email})`));
    process.exit(0);
};

run().catch(console.error);
