// frontend/services/aiService.js
import axios from "axios";

// 🔥 Strict production-safe API URL
const BASE_URL = import.meta.env.VITE_API_URL;

// Final API endpoint
const API_URL = BASE_URL
  ? `${BASE_URL.replace(/\/$/, "")}/api/ai/chat`
  : "http://localhost:5000/api/ai/chat"; // dev only

export const getAIResponse = async (prompt) => {
  try {
    if (!prompt || prompt.trim() === "") {
      return "⚠️ Prompt is empty";
    }

    // 🔥 Debug log (important for mobile)
    console.log("API URL:", API_URL);

    const res = await axios.post(
      API_URL,
      { prompt },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 🔥 Mobile networks slow (30s can fail)
        withCredentials: false,
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
      err?.response?.data || err.message
    );

    // 🔥 Network error (MOST COMMON on mobile)
    if (!err.response) {
      return "📡 Network error: API not reachable (check VITE_API_URL)";
    }

    if (err.response?.data?.error?.message) {
      return `⚠️ ${err.response.data.error.message}`;
    }

    if (err.response?.data?.message) {
      return `⚠️ ${err.response.data.message}`;
    }

    if (err.code === "ECONNABORTED") {
      return "⚠️ Server timeout (Render cold start)";
    }

    return "⚠️ Failed to get AI response";
  }
};