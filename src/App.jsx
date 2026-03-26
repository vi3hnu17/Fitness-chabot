import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [messages, setMessages] = useState([
    { text: "Hi! I am your AI fitness coach.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("generic");
  const [participantId] = useState("P001");
  const [sessionId] = useState(`S-${Date.now()}`);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const apiUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:3001/chat"
          : "/api/chat";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          participantId,
          sessionId,
          message: input,
          mode
        })
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { text: data.reply, sender: "bot" }
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to backend", sender: "bot" }
      ]);
    }

    setInput("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto", fontFamily: "Arial" }}>
      <h1>AI Fitness Chatbot</h1>

      <div style={{ marginBottom: 10 }}>
        <label>Mode: </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{
            border: "1px solid #ccc",
            outline: "none",
            boxShadow: "none",
            padding: "6px"
          }}
        >
          <option value="generic">Generic (Phase 1)</option>
          <option value="adaptive">Adaptive (Phase 2)</option>
        </select>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
          borderRadius: 0,
          boxSizing: "border-box"
        }}
      >
        {messages.map((msg, index) => (
          <p
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "8px 0"
            }}
          >
            <b>{msg.sender === "user" ? "You" : "Coach"}:</b> {msg.text}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type how you feel (e.g., I am tired)"
        style={{
          width: "70%",
          padding: 8,
          border: "1px solid #ccc",
          outline: "none",
          boxShadow: "none",
          borderRadius: 0,
          boxSizing: "border-box"
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          padding: 8,
          marginLeft: 10,
          border: "1px solid #ccc",
          background: "white",
          cursor: "pointer",
          borderRadius: 0
        }}
      >
        Send
      </button>

      <div style={{ marginTop: 15, fontSize: 12, color: "gray" }}>
        <p>Participant ID: {participantId}</p>
        <p>Session ID: {sessionId}</p>
      </div>
    </div>
  );
}