const axios = require("axios");
require("dotenv").config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = "openai/gpt-4o-mini";

async function getAIResponse(prompt) {
  try {
    console.log("Sending to OpenRouter:", prompt);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Project",
        },
      }
    );

    const aiMessage = response.data?.choices?.[0]?.message?.content;
    return aiMessage || "No response from AI";
  } catch (error) {
    console.error("Error from OpenRouter API:", error.response?.data || error.message);
    return "⚠️ AI service failed. Try again later.";
  }
}

// Controller for Express route
async function handleAIRequest(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const aiReply = await getAIResponse(prompt);
    res.json({ message: aiReply });
  } catch (err) {
    console.error("AI Controller Error:", err.message);
    res.status(500).json({ message: "AI service failed" });
  }
}

module.exports = {
  getAIResponse,
  handleAIRequest,
};
