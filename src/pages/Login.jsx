import { useState, useEffect } from "react";
import { loginUser } from "../services/auth.service";
import "./Login.css";
import * as jwtDecodeModule from "jwt-decode";
const jwtDecode = jwtDecodeModule.default || jwtDecodeModule;

export default function Login({ onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token) {
      localStorage.setItem("token", token);
      let loggedInUser = null;

      if (userStr) {
        try {
          loggedInUser = JSON.parse(decodeURIComponent(userStr));
        } catch (err) {
          console.error("Failed to parse user from query", err);
        }
      }

      if (!loggedInUser) {
        try {
          const decoded = jwtDecode(token);
          loggedInUser = { id: decoded.id, email: decoded.email || "" };
        } catch (err) {
          console.error("JWT decode failed", err);
        }
      }

      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        onLogin && onLogin(loggedInUser);
      }

      onClose && onClose();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onLogin, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin && onLogin(data.user);
        onClose && onClose();
      } else {
        alert(data.msg || "Login failed");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }

    setLoading(false);
  };

  // ✅ UPDATED HERE (live backend URL)
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div className="login-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <h1>Welcome back</h1>
        <p className="login-sub">Login to continue</p>

        <div className="social-login">
          <button className="google-btn" onClick={handleGoogleLogin}>
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
            />
            Continue with Google
          </button>
          <button className="github-btn" disabled>Continue with GitHub</button>
        </div>

        <div className="divider"><span>OR</span></div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account? <span>Sign up</span>
        </p>
      </div>
    </div>
  );
}
