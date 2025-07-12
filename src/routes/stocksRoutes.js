const express = require("express");
const router = express.Router();
const stocksController = require("../controllers/stocksController");

router.post("/save-chat", stocksController.saveSession);
router.get("/list-sessions/:company/:user_email", stocksController.getSessions);
router.get("/get-chat/:company/:user_email/:session_id", stocksController.getMessages);

module.exports = router;