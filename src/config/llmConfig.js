const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("google-generative-ai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  openai,
  genAI,
};