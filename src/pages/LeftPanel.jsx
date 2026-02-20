import React, { useState, useRef, useEffect } from "react";
import "./LeftPanel.css";

export default function LeftPanel({
  user,
  onLoginOpen,
  onLogout,
  chatHistory,
  onNewChat,
  activeChat,
  onDeleteChat,
  onRenameChat,
  onPinChat,
  onArchiveChat,
  onShareChat,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [chatMenuOpenId, setChatMenuOpenId] = useState(null);

  const historyRef = useRef(null);
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setHistoryOpen(false);
        setProfileDropdownOpen(false);
        setChatMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (email) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2)
      return (parts[0][0] + parts[1][0]).toUpperCase();
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen((open) => !open)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`left-panel ${menuOpen ? "open" : ""}`}
      >
        <div className="logo">AI Assistant</div>

        {/* Menu Buttons */}
        <div className="menu-buttons">
          <button
            className="new-chat-btn"
            onClick={() => {
              setHistoryOpen(false);
              if (onNewChat) onNewChat();
            }}
          >
            + New Chat
          </button>

          <button
            className="history-btn"
            onClick={() => setHistoryOpen((open) => !open)}
          >
            Chat History
          </button>
        </div>

        {/* Chat History Panel */}
        {historyOpen && (
          <div className="chat-history-panel" ref={historyRef}>
            <div className="chat-history-header">
              Chat History
            </div>

            {!chatHistory || chatHistory.length === 0 ? (
              <p className="no-chat-text">No chats yet.</p>
            ) : (
              chatHistory
                .slice()
                .reverse()
                .map((chat, idx) => (
                  <div
                    key={chat._id || idx}
                    className={`chat-history-item ${activeChat?._id === chat._id
                      ? "active"
                      : ""
                      }`}
                    title={chat.title || "Chat"}
                  >
                    {/* Click Chat */}
                    <div
                      className="chat-history-content"
                      onClick={() => {
                        if (onNewChat) onNewChat(chat);
                        setHistoryOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      <div className="chat-history-preview">
                        {chat.title ||
                          chat.messages?.[0]?.text?.slice(
                            0,
                            40
                          ) ||
                          "Chat"}
                      </div>

                      <div className="chat-history-date">
                        {chat.date
                          ? new Date(
                            chat.date
                          ).toLocaleString()
                          : ""}
                      </div>
                    </div>

                    {/* Three Dot Button */}
                    <button
                      className="chat-options-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatMenuOpenId(
                          chatMenuOpenId === chat._id
                            ? null
                            : chat._id
                        );
                      }}
                    >
                      ⋯
                    </button>

                    {/* Dropdown */}
                    {chatMenuOpenId === chat._id && (
                      <div className="chat-dropdown">
                        <div
                          className="chat-dropdown-item"
                          onClick={() => {
                            onShareChat?.(chat._id);
                            setChatMenuOpenId(null);
                          }}
                        >
                          🔗 Share
                        </div>

                        <div className="chat-dropdown-item">
                          👥 Start group chat
                        </div>

                        <div
                          className="chat-dropdown-item"
                          onClick={() => {
                            onRenameChat?.(chat._id);
                            setChatMenuOpenId(null);
                          }}
                        >
                          ✏️ Rename
                        </div>

                        <div
                          className="chat-dropdown-item"
                          onClick={() => {
                            onPinChat?.(chat._id);
                            setChatMenuOpenId(null);
                          }}
                        >
                          📌 Pin chat
                        </div>

                        <div
                          className="chat-dropdown-item"
                          onClick={() => {
                            onArchiveChat?.(chat._id);
                            setChatMenuOpenId(null);
                          }}
                        >
                          📦 Archive
                        </div>



                        <hr />

                        <div
                          className="chat-dropdown-item delete"
                          onClick={() => {
                            if (onDeleteChat) {
                              onDeleteChat(chat._id);
                            }
                            setChatMenuOpenId(null);
                          }}
                        >
                          🗑 Delete
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}

        {/* Profile Section */}
        <div className="profile-section" ref={menuRef}>
          {user ? (
            <>
              <div
                className="profile-summary"
                onClick={() =>
                  setProfileDropdownOpen(
                    (open) => !open
                  )
                }
              >
                <div className="avatar">
                  {getInitials(user.email)}
                </div>

                <div className="user-info">
                  <div className="user-email">
                    {user.email}
                  </div>
                  <div className="user-plan">
                    Free
                  </div>
                </div>

                <button className="upgrade-btn">
                  Upgrade
                </button>
              </div>

              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-item">
                    ✨ Upgrade plan
                  </div>

                  <div className="profile-dropdown-item">
                    🧑‍🎨 Personalization
                  </div>

                  <div className="profile-dropdown-item">
                    ⚙️ Settings
                  </div>

                  <hr />

                  <div className="profile-dropdown-item">
                    ❓ Help
                  </div>

                  <div
                    className="profile-dropdown-item logout-item"
                    onClick={onLogout}
                  >
                    ↩️ Log out
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              className="login-btn"
              onClick={onLoginOpen}
            >
              Login
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
