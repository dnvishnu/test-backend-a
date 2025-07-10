const express = require("express");
const router = express.Router();

const { llmHandler  } = require("../controllers/llmController");

router.post("/llm", llmHandler);

module.exports = router;
