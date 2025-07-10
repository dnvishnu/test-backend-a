const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  assistant_id: { type: String, required: true },
  user_email: { type: String, required: true },
  user_info: { type: Array, required: true },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("user_profiles", userProfileSchema);
