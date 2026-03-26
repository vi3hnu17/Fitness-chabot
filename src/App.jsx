import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [messages, setMessages] = useState([
    { text: "Hi! I am your AI fitness coach.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("generic");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: input,
          mode: mode
        })
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { text: data.reply, sender: "bot" }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to backend", sender: "bot" }
      ]);
    }

    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Fitness Chatbot</h1>

      <div style={{ marginBottom: 10 }}>
        <label>Mode: </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="generic">Generic</option>
          <option value="adaptive">Adaptive</option>
        </select>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "scroll",
          padding: 10,
          marginBottom: 10
        }}
      >
        {messages.map((msg, index) => (
          <p key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <b>{msg.sender === "user" ? "You" : "Coach"}:</b> {msg.text}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "70%", padding: 8 }}
      />
      <button onClick={sendMessage} style={{ padding: 8, marginLeft: 10 }}>
        Send
      </button>
      <Analytics />
    </div>
  );
}