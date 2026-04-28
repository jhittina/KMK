require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User.model");

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@kmkhall.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@kmkhall.com",
      password: "admin123", // Will be hashed by model
      role: "admin",
      phone: "9999999999",
    });

    console.log("✅ Admin user created successfully");
    console.log("📧 Email: admin@kmkhall.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Role: admin");

    // Create a staff user for testing
    const staff = await User.create({
      name: "Staff User",
      email: "staff@kmkhall.com",
      password: "staff123",
      role: "staff",
      phone: "8888888888",
    });

    console.log("\n✅ Staff user created successfully");
    console.log("📧 Email: staff@kmkhall.com");
    console.log("🔑 Password: staff123");
    console.log("👤 Role: staff");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating users:", error);
    process.exit(1);
  }
};

createAdminUser();
