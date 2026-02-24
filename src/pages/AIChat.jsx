import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAIResponse } from "../services/ai.service";
import "./AIChat.css";

/* ================= CODE BLOCK ================= */
const CodeBlock = ({ inline, className, children }) => {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!codeRef.current) return;
    navigator.clipboard.writeText(codeRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (inline) return <code className={className}>{children}</code>;

  const language = className?.replace("language-", "") || "code";

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{language.toUpperCase()}</span>
        <button onClick={handleCopy} className="copy">
          {copied ? "✅ Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code ref={codeRef} className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
};

/* ================= AI CHAT ================= */
export default function AIChat({
  chatHistory = [],
  activeChat,
  onHistoryUpdate,
}) {
  const [messages, setMessages] = useState(chatHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stopStream, setStopStream] = useState(false);

  const chatEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  /* ================= LOAD CHAT ================= */
  useEffect(() => {
    setMessages(chatHistory || []);
  }, [chatHistory, activeChat]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (autoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  /* ================= STREAM AI ================= */
  const streamText = async (text) => {
    setStopStream(false);

    // 👇 empty AI message pehle push hota hai
    setMessages((prev) => [...prev, { type: "ai", text: "" }]);

    let currentText = "";

    for (let i = 0; i < text.length; i++) {
      if (stopStream) break;

      currentText += text[i];

      // 👇 har character pe React re-render
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          type: "ai",
          text: currentText,
        };
        return copy;
      });

      // 👇 typing delay (ChatGPT feel)
      await new Promise((r) => setTimeout(r, 12));
    }

    return currentText;
  };

  /* ================= SEND MESSAGE ================= */
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const prompt = input;
    setInput("");
    setLoading(true);

    const userMsg = { type: "user", text: prompt };
    const updatedUserMessages = [...messages, userMsg];

    // ✅ user message show immediately
    setMessages(updatedUserMessages);

    try {
      const aiText = await getAIResponse(prompt);

      // ✅ AI typing effect
      const finalText = await streamText(aiText);

      // ✅ SAVE chat only once after AI completes
      const finalMessages = [...updatedUserMessages, { type: "ai", text: finalText }];
      onHistoryUpdate(finalMessages);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "⚠️ Something went wrong";

      const errorMessages = [...updatedUserMessages, { type: "ai", text: errorMsg }];
      setMessages(errorMessages);
      onHistoryUpdate(errorMessages);
    } finally {
      setLoading(false);
      setStopStream(false);
    }
  };

  const handleStop = () => setStopStream(true);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      loading ? handleStop() : handleSend();
    }
  };

  /* ================= UI ================= */
  return (
    <div className="ai-chat-wrapper">
      <div className="chat-glass">
        <div
          className="chat-box"
          ref={chatBoxRef}
          onScroll={() => {
            const el = chatBoxRef.current;
            if (!el) return;
            setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
          }}
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`msg-row ${msg.type}`}>
              <div className="msg-bubble">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ code: CodeBlock }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything..."
          />

          {!loading ? (
            <button onClick={handleSend}>➤</button>
          ) : (
            <button onClick={handleStop} className="stop-btn">
              ⏹
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
