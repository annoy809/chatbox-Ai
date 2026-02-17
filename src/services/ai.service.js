import axios from "axios";

const API_URL = "http://localhost:5000/api/ai/chat";

export const getAIResponse = async (prompt) => {
  try {
    if (!prompt || prompt.trim() === "") return "⚠️ Prompt is empty";

    const res = await axios.post(
      API_URL,
      { prompt },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    // Handle normal response
    if (res.data?.message) return res.data.message;

    // Handle backend error object gracefully
    if (res.data?.error) {
      // Convert object to string if needed
      return typeof res.data.error === "string"
        ? `⚠️ ${res.data.error}`
        : `⚠️ ${JSON.stringify(res.data.error)}`;
    }

    return "⚠️ No response from AI";
  } catch (err) {
    console.error("❌ Frontend AI Error:", err);

    if (err.response) {
      const errorData = err.response.data?.error || err.response.data?.message || "Backend error";
      return typeof errorData === "string"
        ? `⚠️ ${errorData}`
        : `⚠️ ${JSON.stringify(errorData)}`;
    } else if (err.request) {
      return "⚠️ No response from backend. Check server or network.";
    } else {
      return `⚠️ Request Error: ${err.message}`;
    }
  }
};
