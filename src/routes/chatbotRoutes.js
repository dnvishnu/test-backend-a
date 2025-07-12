const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// Chat history routes
router.post("/save-chat", chatbotController.saveChatSession);
router.get("/list-sessions/:assistant_id/:user_email", chatbotController.getChatSessions);
router.get("/get-chat/:assistant_id/:user_email/:session_id", chatbotController.getSessionMessages);

// User profile routes
router.post("/save-profile", chatbotController.saveUserProfile);
router.get("/profile/:assistant_id/:user_email", chatbotController.getUserProfile);

module.exports = router;