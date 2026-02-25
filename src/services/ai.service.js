// backend/services/aiService.js (actually this is frontend service)
import axios from "axios";

// 🔥 Auto: Render (prod) + Local (dev)
const API_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/ai/chat`
    : "http://localhost:5000/api/ai/chat";

export const getAIResponse = async (prompt) => {
  try {
    if (!prompt || prompt.trim() === "") {
      return "⚠️ Prompt is empty";
    }

    const res = await axios.post(
      API_URL,
      { prompt },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    // Proper response handling (no [object Object])
    if (res.data?.message) return res.data.message;
    if (res.data?.reply) return res.data.reply;
    if (typeof res.data === "string") return res.data;

    return res.data?.message || "⚠️ No response from AI";
  } catch (err) {
    console.error(
      "❌ Frontend AI Error:",
      err.response?.data || err.message
    );

    if (err.response?.data?.error?.message) {
      return `⚠️ ${err.response.data.error.message}`;
    }

    if (err.response?.data?.message) {
      return `⚠️ ${err.response.data.message}`;
    }

    if (err.code === "ECONNABORTED") {
      return "⚠️ Server timeout (Render sleeping)";
    }

    return "⚠️ Failed to get AI response";
  }
};