// src/services/auth.service.js

// 🔒 Local backend auth endpoint only
const API_URL = "http://localhost:5000/api/auth";

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ keep cookies/session
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (err) {
    console.error("❌ Register Error:", err);
    return { error: "Registration failed" };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ keep cookies/session
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (err) {
    console.error("❌ Login Error:", err);
    return { error: "Login failed" };
  }
};
