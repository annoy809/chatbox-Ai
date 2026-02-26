// src/services/auth.service.js

// 🔥 SAME logic as App.jsx (NO .env, NO localhost issue)
const getApiBase = () => {
  const hostname = window.location.hostname;

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  // Deployed frontend (Vercel) → ALWAYS use Render backend
  return "https://chatbox-ai-c6q1.onrender.com";
};

const API_BASE = getApiBase();
const API_URL = `${API_BASE}/api/auth`;

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await res.json();
    return result;
  } catch (err) {
    console.error("❌ Register Error:", err);
    return { error: "Registration failed" };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ⚠️ KEEP THIS
      body: JSON.stringify(data),
    });

    const result = await res.json();
    return result;
  } catch (err) {
    console.error("❌ Login Error:", err);
    return { error: "Login failed" };
  }
};