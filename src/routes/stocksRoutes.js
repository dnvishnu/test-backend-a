const express = require("express");
const router = express.Router();
const stocksController = require("../controllers/stocksController");

router.post("/chats", stocksController.saveSession);
router.get("/chats/:company/:user_email", stocksController.getSessions);
router.get("/chats/:company/:user_email/:session_id", stocksController.getMessages);

module.exports = router;
