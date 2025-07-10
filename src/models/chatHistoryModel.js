const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema({
  assistant_id: { type: String, required: true },
  user_email: { type: String, required: true },
  session_id: { type: String, required: true },
  title: { type: String },
  messages: [messageSchema],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("chat_histories", chatHistorySchema);
