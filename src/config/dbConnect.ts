
import mongoose from 'mongoose'

const dbConnect = async (): Promise<void> => {
    if (!process.env.MONGODB_URL) {
        console.error("MONGODB_URL is not defined in the environment variables.");
        return;
    }
    
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully!");
    } catch (error) {
        console.error("Database Error", error);
    }
};

export default dbConnect;
