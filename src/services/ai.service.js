import axios from "axios";

const API_URL = "https://chatbox-ai-c6q1.onrender.com/api/ai";

export const getAIResponse = async (prompt) => {
  try {
    const res = await axios.post(`${API_URL}/chat`, { prompt });
    return res.data.message; // must match backend
  } catch (err) {
    console.error("Frontend AI error:", err.response?.data || err.message);
    // Return backend message if exists
    return err.response?.data?.message || "⚠️ Something went wrong while getting AI response.";
  }
};
