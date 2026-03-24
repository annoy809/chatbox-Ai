import axios from "axios";

// 🔥 Strict production-safe API URL
const BASE_URL = import.meta.env.VITE_API_URL;

// Final API endpoint
const API_URL = BASE_URL
  ? `${BASE_URL.replace(/\/$/, "")}/api/ai/chat`
  : "http://localhost:5000/api/ai/chat"; // dev only

// 🔥 UPDATED: imageUrl parameter added (without removing anything)
export const getAIResponse = async (prompt, image = null) => {
  try {
    if ((!prompt || prompt.trim() === "") && !image) {
      return "⚠️ Prompt is empty";
    }

    console.log("API URL:", API_URL);
    console.log("Sending Image:", image ? "YES" : "NO");

    // 🔥 If image exists, assume it's URL (not base64)
    const payload = {
      prompt,
      imageUrl: image || null, // 🔥 renamed for backend clarity
    };

    const res = await axios.post(
      API_URL,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
        withCredentials: false,
      }
    );

    // Proper response handling
    if (res.data?.message) return res.data.message;
    if (res.data?.reply) return res.data.reply;
    if (typeof res.data === "string") return res.data;

    return res.data?.message || "⚠️ No response from AI";

  } catch (err) {
    console.error(
      "❌ Frontend AI Error:",
      err?.response?.data || err.message
    );

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