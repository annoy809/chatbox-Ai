const axios = require("axios");
require("dotenv").config();

// ✅ Config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = "openai/gpt-4o-mini";

// 🔹 Function to call OpenRouter AI API
async function getAIResponse(prompt) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing in backend .env");
  }

  try {
    console.log("✅ Sending request to OpenRouter:", { model: MODEL_NAME, prompt });

    // OpenRouter expects 'messages' array with role: system/user/assistant
const response = await axios.post(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    model: MODEL_NAME,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  },
  {
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "ai-project",
    },
    timeout: 30000,
  }
);


    console.log("✅ OpenRouter Response:", response.data);

    // Make sure choices exist
    if (!response.data?.choices || response.data.choices.length === 0) {
      throw new Error("No choices returned from OpenRouter");
    }

    // Return AI message
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("❌ AI Service Error Details:", err.response?.data || err.message || err);
    throw new Error(
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Unknown AI service error"
    );
  }
}

// 🔹 Express Controller
async function handleAIRequest(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const aiReply = await getAIResponse(prompt);
    res.status(200).json({ message: aiReply });
  } catch (err) {
    console.error("❌ AI Controller Error:", err.message);
res.status(500).json({
  message: "AI service failed",
  error:
    err.response?.data ||
    err.message ||
    "Unknown AI error",
});
  }
}

module.exports = {
  getAIResponse,
  handleAIRequest,
};
