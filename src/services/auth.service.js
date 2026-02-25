// src/services/auth.service.js

// 🔥 Auto switch: Render (production) OR Localhost (development)
const API_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/auth`
    : "http://localhost:5000/api/auth";

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ required for cookies/session
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
      credentials: "include", // ✅ VERY IMPORTANT (do not remove)
      body: JSON.stringify(data),
    });

    const result = await res.json();
    return result;
  } catch (err) {
    console.error("❌ Login Error:", err);
    return { error: "Login failed" };
  }
};