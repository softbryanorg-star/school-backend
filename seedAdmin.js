import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./model/admin.js";

dotenv.config();

const seedAdmin = async () => {   //Declares an asynchronous function to handle DB operations.
  try {
    // Mongoose 6+ no longer requires or supports the legacy connection flags
    await mongoose.connect(process.env.MONGO_URL);

    const envEmail = typeof process.env.ADMIN_EMAIL === "string" ? process.env.ADMIN_EMAIL.trim().toLowerCase() : process.env.ADMIN_EMAIL;   //Ensures email is trimmed and lowercase                                
    const envPassword = typeof process.env.ADMIN_PASSWORD === "string" ? process.env.ADMIN_PASSWORD.trim() : process.env.ADMIN_PASSWORD;     //Ensures password is trimmed

    if (!envEmail || !envPassword) {
      console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
      process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ email: envEmail });

    if (existingAdmin) {
      existingAdmin.password = envPassword;
      await existingAdmin.save();
      console.log("Existing admin found — password updated from .env");
      process.exit();
    }

    // Create admin using plaintext password so the model pre-save hook hashes it once
    await Admin.create({
      name: process.env.ADMIN_NAME,
      email: envEmail,
      password: envPassword,
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedAdmin();   // Calls the function to execute the seeding process.

//This script creates a default admin in the database using credentials stored in environment variables


//i separated admin seeding from the main server so that i can create a default admin securely
//  using environment variables.
//The password is hashed with bcrypt, and the script checks for duplicates before creating the user.
//This makes onboarding, testing, and deployments safe and repeatable.”