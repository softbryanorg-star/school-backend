import mongoose from "mongoose";

//Declares an async function to connect to MongoDB.
// Using async allows us to await the connection and handle errors with try/catch
const connectDB = async () => {   
try {
await mongoose.connect(process.env.MONGO_URL);
console.log("MongoDB connected");

} catch (error) {
console.error('Error connecting to Database Soft', error);
process.exit(1);
}
};


export default connectDB;  //i exported the function so it can be called back in my server.js

                     //This file handles connecting to MongoDB. 
// Separating it keeps the server initialization clean and allows reusability, testing, and better error handling.”