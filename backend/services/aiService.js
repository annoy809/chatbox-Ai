// src/services/aiService.js
import axios from "axios";

// 🔒 Local backend only
const API_URL = "http://localhost:5000/api/chat";

export const getAIResponse = async (prompt) => {
  try {
    const res = await axios.post(
      API_URL,
      { prompt },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.message;
  } catch (err) {
    console.error(
      "❌ Frontend AI Error:",
      err.response?.data || err.message
    );

    return "⚠️ Failed to get AI response";
  }
};
