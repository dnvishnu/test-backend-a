const mongoose = require("mongoose");

async function connectDB() {
  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Stop app if DB fails
  }
}

module.exports = connectDB;