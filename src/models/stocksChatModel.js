const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const stocksChatSchema = new mongoose.Schema({
  company: { type: String, required: true },
  user_email: { type: String, required: true },
  session_id: { type: String, required: true },
  title: { type: String },
  messages: [messageSchema],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("stocks_chats", stocksChatSchema);