import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import AIChat from "./pages/AIChat.jsx";
import Login from "./pages/Login.jsx";
import LeftPanel from "./pages/LeftPanel.jsx";

import * as jwtDecodeModule from "jwt-decode";
const jwtDecode = jwtDecodeModule.default || jwtDecodeModule;

/* ================= WRAPPER ================= */
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

/* ================= APP ================= */
function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const [allChats, setAllChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  /* ================= LOAD USER / JWT ================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      try {
        const decoded = jwtDecode(token);
        const loggedUser = { id: decoded.id, email: decoded.email || "" };
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setUser(loggedUser);
      } catch (err) {
        console.error("JWT decode failed", err);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

/* ================= FETCH CHATS ================= */
useEffect(() => {
  if (!user) return;

  fetch("https://chatbox-ai-c6q1.onrender.com/api/chat/my", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((chats) => {
      setAllChats(chats);

      if (chats.length > 0) {
        setActiveChat(chats[0]);
        setChatHistory(chats[0].messages || []);
      }
    })
    .catch((err) => console.error("Fetch chats error:", err));
}, [user]);


  /* ================= AUTH ================= */
  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem("user", JSON.stringify(loggedUser));
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setAllChats([]);
    setActiveChat(null);
    setChatHistory([]);
    navigate("/");
  };

  /* ================= CHAT HANDLERS ================= */

  // Load existing chat OR start new empty chat
  const handleNewChat = (chat) => {
    if (chat?._id) {
      setActiveChat(chat);
      setChatHistory(chat.messages || []);
      return;
    }

    // 🆕 new unsaved chat
    setActiveChat(null);
    setChatHistory([
      { type: "ai", text: "Hi 👋 I'm your AI assistant. Ask me anything." },
    ]);
  };

  // Save/update chat after every message
  const handleChatHistoryUpdate = async (messages) => {
  setChatHistory(messages);

  try {
    const res = await fetch(
      "https://chatbox-ai-c6q1.onrender.com/api/chat/save",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          chatId: activeChat?._id,
          messages,
        }),
      }
    );

    const savedChat = await res.json();

    setActiveChat(savedChat);

    setAllChats((prev) => {
      const exists = prev.find((c) => c._id === savedChat._id);
      if (exists) {
        return prev.map((c) =>
          c._id === savedChat._id ? savedChat : c
        );
      }
      return [savedChat, ...prev];
    });
  } catch (err) {
    console.error("Save chat failed:", err);
  }
};

  /* ================= RENDER ================= */
  return (
    <div className="app-container" style={{ display: "flex" }}>
      <LeftPanel
        user={user}
        chatHistory={allChats}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onLoginOpen={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      <main className="chat-area" style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <AIChat
                key={activeChat?._id || "new"}
                chatHistory={chatHistory}
                activeChat={activeChat}
                onHistoryUpdate={handleChatHistoryUpdate}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLogin={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default AppWrapper;
