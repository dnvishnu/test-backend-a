const { openai, genAI } = require("../config/llmConfig");
const axios = require("axios");

const normalizeParams = (params = {}) => ({
  temperature: params.temperature,
  max_tokens: params.maxTokens,
  top_p: params.topP,
  frequency_penalty: params.frequencyPenalty,
  presence_penalty: params.presencePenalty,
  n: params.n,
});

const defaultParams = {
  temperature: 0.7,
  max_tokens: 1500,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  n: 1,
};

async function callOpenAI(promptChain, model) {
  const responses = await Promise.all(
    promptChain.map(async (step, index) => {
      const { messages = [], parameters = {} } = step;
      const finalParams = { ...defaultParams, ...normalizeParams(parameters) };

      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: finalParams.temperature,
        max_tokens: finalParams.max_tokens,
        top_p: finalParams.top_p,
        frequency_penalty: finalParams.frequency_penalty,
        presence_penalty: finalParams.presence_penalty,
        n: finalParams.n,
      });

      const content = response.choices?.[0]?.message?.content?.trim() || "";
      return `${content}`;
    })
  );

  return responses.join("\n\n&nbsp;\n\n");
}

async function callAzureOpenAI(promptChain, model) {
  const responses = await Promise.all(
    promptChain.map(async (step, index) => {
      const { messages = [], parameters = {} } = step;
      const finalParams = { ...defaultParams, ...normalizeParams(parameters) };

      const response = await axios.post(
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${model}/chat/completions?api-version=2024-02-01`,
        {
          messages,
          ...finalParams,
        },
        {
          headers: {
            "api-key": process.env.AZURE_OPENAI_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const content = response.data?.choices?.[0]?.message?.content?.trim() || "";
      return `${content}`;
    })
  );

  return responses.join("\n\n&nbsp;\n\n");
}

async function callGemini(promptChain, model) {
  const responses = await Promise.all(
    promptChain.map(async (step, index) => {
      const { messages = [], parameters = {} } = step;
      const textPrompt = messages.map((msg) => msg.content).join("\n");

      const finalParams = {
        temperature: parameters.temperature ?? 0.7,
        topP: parameters.topP ?? 1,
        maxOutputTokens: parameters.maxOutputTokens ?? 2048,
      };

      const modelInstance = genAI.getGenerativeModel({ model });
      const result = await modelInstance.generateContent({
        contents: [{ parts: [{ text: textPrompt }] }],
        generationConfig: finalParams,
      });

      const response = await result.response;
      const text = response.text().trim();

      return `${text}`;
    })
  );

  return responses.join("\n\n&nbsp;\n\n");
}

module.exports = {
  callOpenAI,
  callAzureOpenAI,
  callGemini,
};
