require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/leaddesk";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@leaddesk.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    let admin = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    }).select("+password");

    if (admin) {
      admin.name = "LeadDesk Admin";
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.isActive = true;

      await admin.save();

      console.log("=================================");
      console.log("Admin account RESET successfully");
      console.log("Email:", ADMIN_EMAIL);
      console.log("Password:", ADMIN_PASSWORD);
      console.log("Role:", admin.role);
      console.log("Active:", admin.isActive);
      console.log("=================================");
    } else {
      admin = await User.create({
        name: "LeadDesk Admin",
        email: ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });

      console.log("=================================");
      console.log("Admin account CREATED successfully");
      console.log("Email:", ADMIN_EMAIL);
      console.log("Password:", ADMIN_PASSWORD);
      console.log("Role:", admin.role);
      console.log("Active:", admin.isActive);
      console.log("=================================");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:");
    console.error(error);

    try {
      await mongoose.disconnect();
    } catch (_) {}

    process.exit(1);
  }
}

seedAdmin();