const { callOpenAI, callAzureOpenAI, callGemini } = require("../services/llmService");

async function llmHandler(req, res) {
  const {
    promptChain = [],
    userQuery = "",
    model = "gpt-4o",
    llm = "openai", // openai | gemini | azure-openai
  } = req.body;

  if (!Array.isArray(promptChain) || promptChain.length === 0 || !userQuery.trim()) {
    return res.status(400).json({ error: "Prompt chain and user query are required" });
  }

  try {
    let answer = "";

    if (llm === "openai") {
      answer = await callOpenAI(promptChain, model);
    } else if (llm === "azure-openai") {
      answer = await callAzureOpenAI(promptChain, model);
    } else if (llm === "gemini") {
      answer = await callGemini(promptChain, model);
    } else {
      return res.status(400).json({ error: "Invalid LLM provider" });
    }

    return res.json({ answer });
  } catch (error) {
    console.error("LLM Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "LLM call failed" });
  }
}

module.exports = {
  llmHandler,
};