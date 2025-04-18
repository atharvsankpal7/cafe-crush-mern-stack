import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Staff from "../models/staffModel.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing admin users
    // await Staff.deleteMany({});

    // Create admin users
    const adminUsers = [
      {
        name: "Super Admin",
        email: "admin@cafecrush.com",
        password: "admin123",
        role: "admin",
        phone: "1234567890",
        address: "Admin Office",
        isActive: true,
        salary: 50000,
        age: 30,
        gender: "male",
        image: "https://via.placeholder.com/150",
      },
    ];

    // Insert admin users
    await Staff.insertMany(adminUsers);

    console.log("Admin users seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin users:", error);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();
