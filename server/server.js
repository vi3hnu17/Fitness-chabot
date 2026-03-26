import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config({ path: "./server/.env" });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Log file path
const logFilePath = path.join("server", "logs.jsonl");

// Save logs function
function saveLog(data) {
  const logLine = JSON.stringify(data) + "\n";

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error("Error saving log:", err);
    }
  });
}

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


// =========================
// CHAT ROUTE (MAIN LOGIC)
// =========================
app.post("/chat", async (req, res) => {
  try {
    const { participantId, sessionId, message, mode } = req.body;

    if (!message || !mode) {
      return res.status(400).json({
        reply: "Missing message or mode",
      });
    }

    // 🔥 BASE PROMPT
    let prompt = `
You are an AI resistance-training coach assisting a user during squat exercise.

Rules:
- Keep responses very short (1-2 sentences)
- Be supportive, clear, and non-judgmental
- Do NOT give medical advice
- Focus on motivation and simple technique cues
`;

    // 🔥 GENERIC MODE
    if (mode === "generic") {
      prompt += `
Give general motivation only.
Do not personalize based on user feelings.
Example: "Keep going, you are doing great."
`;
    }

    // 🔥 ADAPTIVE MODE
    else if (mode === "adaptive") {
      prompt += `
Adapt your response based on the user's input:

- If the user expresses fatigue → show empathy and suggest pacing
- If the user mentions form or technique → give ONE simple squat tip
- If the user seeks motivation → respond with strong encouragement
- Make the response feel natural and human-like
`;
    }

    // 🔥 GEMINI CALL
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}\n\nUser: ${message}`,
    });

    const reply = response.text || "No response from Gemini.";

    // 🔥 SAVE CHAT LOG
    saveLog({
      type: "chat",
      participantId: participantId || "unknown",
      sessionId: sessionId || "unknown",
      timestamp: new Date().toISOString(),
      mode,
      prompt,
      userMessage: message,
      botReply: reply,
    });

    res.json({ reply });

  } catch (error) {
    console.error("Gemini error:", error);

    // 🔥 SAVE ERROR LOG
    saveLog({
      type: "error",
      route: "/chat",
      timestamp: new Date().toISOString(),
      error: error.message,
    });

    res.status(500).json({
      reply: "Error with AI response",
      error: error.message,
    });
  }
});


// =========================
// SURVEY ROUTE
// =========================
app.post("/survey", (req, res) => {
  try {
    const { participantId, sessionId, question, answer, phase } = req.body;

    if (!question || !answer || !phase) {
      return res.status(400).json({
        success: false,
        message: "Missing question, answer, or phase",
      });
    }

    // 🔥 SAVE SURVEY LOG
    saveLog({
      type: "survey",
      participantId: participantId || "unknown",
      sessionId: sessionId || "unknown",
      phase,
      question,
      answer,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Survey saved successfully",
    });

  } catch (error) {
    console.error("Survey error:", error);

    saveLog({
      type: "error",
      route: "/survey",
      timestamp: new Date().toISOString(),
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Error saving survey",
    });
  }
});


// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});