import axios from 'axios';

const API_URL = 'https://chatbox-ai-c6q1.onrender.com/api/ai';

export const getAIResponse = async (prompt) => {
  try {
    const res = await axios.post(`${API_URL}/chat`, { prompt }); // must match backend route
    return res.data.message;
  } catch (err) {
    console.error(err);
    return 'Error getting AI response';
  }
};
