import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
    const uri = process.env.MONGODB_URI as string;
    if(!uri) throw new Error("MongoDB_URI was not set!");
    try {
        await mongoose.connect(uri);
        console.log("DB connected successfully!");
    } catch (err) {
        console.log("Failed to connect DB!", err)
        process.exit(1);
    }
}