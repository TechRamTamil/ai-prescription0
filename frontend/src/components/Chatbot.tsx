"use client";

import { useState, useRef, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  "What are symptoms of diabetes?",
  "When should I see a doctor?",
  "Drug interactions for Ibuprofen",
  "Normal blood pressure range?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      text: "👋 Hi! I'm your AI Medical Assistant. Ask me anything about symptoms, medications, or general health advice.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim(), time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Optimistic typing indicator
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, role: "assistant", text: "...", time: now },
    ]);

    try {
      const token = localStorage.getItem("token") || "guest-token";
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.text !== "...");
        return [
          ...filtered,
          {
            id: Date.now() + 2,
            role: "assistant",
            text: data.response || "I couldn't get a response. Please try again.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      });

      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.text !== "...");
        return [
          ...filtered,
          {
            id: Date.now() + 2,
            role: "assistant",
            text: "⚠️ Connection error. Please ensure the backend is running.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle chat"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          zIndex: 9999,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        {open ? "✕" : "💬"}
        {!open && unread > 0 && (
          <span style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "20px",
            height: "20px",
            background: "#ef4444",
            borderRadius: "50%",
            fontSize: "0.65rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: "5rem",
          right: "1.5rem",
          width: "360px",
          maxHeight: "520px",
          background: "rgba(15, 23, 42, 0.97)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          zIndex: 9998,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
          animation: "chatSlideUp 0.25s ease",
        }}>

          {/* Header */}
          <div style={{
            padding: "1rem 1.25rem",
            background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
            borderBottom: "1px solid rgba(99,102,241,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", flexShrink: 0,
            }}>🩺</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#f1f5f9" }}>AI Medical Assistant</p>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#22c55e", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                Online • Powered by Gemini
              </p>
            </div>
            <button
              onClick={() => setMessages([{
                id: 0, role: "assistant",
                text: "👋 Hi! I'm your AI Medical Assistant. Ask me anything about symptoms, medications, or general health advice.",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }])}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.7rem", padding: "0.25rem 0.5rem", borderRadius: "6px" }}
              title="Clear chat"
            >🗑</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            maxHeight: "320px",
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "85%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "rgba(30, 41, 59, 0.9)",
                  border: msg.role === "assistant" ? "1px solid rgba(99,102,241,0.15)" : "none",
                  color: "#f1f5f9",
                  fontSize: "0.82rem",
                  lineHeight: "1.5",
                  wordBreak: "break-word",
                }}>
                  {msg.text === "..." ? (
                    <span style={{ letterSpacing: "0.15em", animation: "chatBlink 1s infinite" }}>●●●</span>
                  ) : msg.text}
                </div>
                <span style={{ fontSize: "0.65rem", color: "#475569", marginTop: "0.25rem", padding: "0 0.25rem" }}>{msg.time}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 1rem 0.75rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(99,102,241,0.4)",
                    background: "rgba(99,102,241,0.1)",
                    color: "#a5b4fc",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "0.75rem 1rem",
            borderTop: "1px solid rgba(99,102,241,0.15)",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a medical question..."
              disabled={loading}
              style={{
                flex: 1,
                background: "rgba(30,41,59,0.8)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "12px",
                padding: "0.55rem 0.9rem",
                color: "#f1f5f9",
                fontSize: "0.82rem",
                outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                width: "38px", height: "38px",
                borderRadius: "50%",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "rgba(51,65,85,0.5)",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {loading ? <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>⏳</span> : "➤"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
