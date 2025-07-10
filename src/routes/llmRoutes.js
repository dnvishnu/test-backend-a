const express = require("express");
const router = express.Router();

const { llmController } = require("../controllers/llmController");

router.post("/llm", llmController.llmHandler);

module.exports = router;
