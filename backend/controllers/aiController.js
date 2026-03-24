const axios = require("axios");
require("dotenv").config();

// ✅ Config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = "openai/gpt-4o";

// 🔹 Function to call OpenRouter AI API
async function getAIResponse(prompt, image = null) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing in backend .env");
  }

  try {
    console.log("✅ Sending request to OpenRouter:", {
      model: MODEL_NAME,
      prompt,
      image: image ? "YES" : "NO",
    });

    // 🔥 Build messages dynamically (TEXT + IMAGE support)
let userContent = [];

if (prompt) {
  userContent.push({
    type: "text",
    text: prompt,
  });
}

if (image) {
  let formattedImage = image;

  // ✅ Agar base64 prefix missing ho to add karo
  if (!image.startsWith("data:image")) {
    formattedImage = `data:image/png;base64,${image}`;
  }

  userContent.push({
    type: "image_url",
    image_url: {
      url: formattedImage,
    },
  });

  console.log("🖼 Image added to OpenRouter request");
}

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODEL_NAME,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: userContent,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.CLIENT_URL ||
            "https://chatbox-ai-c6q1.onrender.com",
          "X-Title": "ai-project",
        },
        timeout: 30000,
      }
    );

    console.log("✅ OpenRouter Response:", response.data);

    if (!response.data?.choices || response.data.choices.length === 0) {
      throw new Error("No choices returned from OpenRouter");
    }

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error(
      "❌ AI Service Error Details:",
      err.response?.data || err.message || err
    );
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
const { prompt, imageUrl } = req.body; // 🔥 match frontend

if ((!prompt || prompt.trim() === "") && !imageUrl) {
  return res.status(400).json({ message: "Prompt or image is required" });
}

const aiReply = await getAIResponse(prompt, imageUrl); // 🔥 pass imageUrl
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