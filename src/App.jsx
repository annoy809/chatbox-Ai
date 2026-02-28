import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate, // 🔥 FIX: missing import
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

  /* ================= BACKEND URL (LOCAL + DEPLOY SAFE) ================= */
  // Local pe: http://localhost:5000
  // Deploy pe: automatically VITE_API_URL use hoga (Render backend)
/* ================= BACKEND URL (DEPLOY + LOCAL FINAL FIX) ================= */
// Vercel (deploy) → Render backend
// Localhost → Local backend
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

  /* ================= FETCH CHATS (REUSABLE) ================= */
  const fetchMyChats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const chats = await res.json();
      setAllChats(chats);
    } catch (err) {
      console.error("Fetch chats error:", err);
    }
  };

  /* ================= FETCH CHATS ================= */
  useEffect(() => {
    if (!user) return;
    fetchMyChats();
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

  /* ================= DELETE CHAT ================= */
  const handleDeleteChat = async (chatId) => {
    if (!chatId) {
      console.error("Invalid chatId:", chatId);
      alert("Invalid Chat ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/chat/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Failed to delete chat: " + (data.message || "Unknown error"));
        return;
      }

      setAllChats((prev) => prev.filter((chat) => chat._id !== chatId));

      if (activeChat?._id === chatId) {
        setActiveChat(null);
        setChatHistory([
          { type: "ai", text: "Hi 👋 I'm your AI assistant. Ask me anything." },
        ]);
      }
    } catch (err) {
      console.error("Delete chat request error:", err);
      alert("Delete chat request failed");
    }
  };
  /* ================= AUTO TITLE GENERATOR ================= */
const generateAutoTitle = (messages) => {
  if (!messages || messages.length === 0) return "New Chat";

  const firstUserMsg = messages.find((m) => m.type === "user");
  if (!firstUserMsg?.text) return "New Chat";

return firstUserMsg.text
  .replace(/[^\w\s]/gi, "")
  .split(" ")
  .slice(0, 6)
  .join(" ")
  .replace(/\b\w/g, (c) => c.toUpperCase());
};

  /* ================= CHAT HANDLERS ================= */
  const handleNewChat = (chat) => {
    if (chat?._id) {
      setActiveChat(chat);
      setChatHistory(chat.messages || []);
      return;
    }

    setActiveChat(null);
    setChatHistory([
      { type: "ai", text: "Hi 👋 I'm your AI assistant. Ask me anything." },
    ]);
  };

  const handleChatHistoryUpdate = async (messages) => {
  setChatHistory(messages);

  try {
    const res = await fetch(`${API_BASE}/api/chat/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        chatId: activeChat?._id,
        messages,
      }),
    });

    const savedChat = await res.json();

    /* ===== AUTO TITLE LOGIC ===== */
if (
  (!savedChat.title || savedChat.title === "Chat") &&
  messages.filter((m) => m.type === "user").length === 1
) {
      const autoTitle = generateAutoTitle(messages);
      savedChat.title = autoTitle;

      // Update title in backend
      await fetch(`${API_BASE}/api/chat/${savedChat._id}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: autoTitle }),
      });
    }

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

  /* ================= RENAME CHAT (FIXED) ================= */
  const handleRenameChat = async (chatId) => {
    const newTitle = prompt("Enter new chat name:");
    if (!newTitle) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/api/chat/${chatId}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      await fetchMyChats(); // 🔥 refresh sidebar
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  /* ================= PIN CHAT (FIXED) ================= */
  const handlePinChat = async (chatId) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/api/chat/${chatId}/pin`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchMyChats();
    } catch (err) {
      console.error("Pin failed:", err);
    }
  };

  /* ================= ARCHIVE CHAT (FIXED) ================= */
  const handleArchiveChat = async (chatId) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/api/chat/${chatId}/archive`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchMyChats();
    } catch (err) {
      console.error("Archive failed:", err);
    }
  };

  /* ================= SHARE CHAT ================= */
  const handleShareChat = (chatId) => {
    const link = `${window.location.origin}/chat/${chatId}`;
    navigator.clipboard.writeText(link);
    alert("Chat link copied!");
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
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onPinChat={handlePinChat}
        onArchiveChat={handleArchiveChat}
        onShareChat={handleShareChat}
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