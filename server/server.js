import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: "./server/.env" });

const app = express();
app.use(cors());
app.use(express.json());

console.log("Loaded key:", process.env.GEMINI_API_KEY ? "YES" : "NO");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, mode } = req.body;

    let prompt = `
You are an AI fitness coach helping a user perform squats.
Keep responses short (1-2 sentences), clear, and motivating.
`;

    if (mode === "generic") {
      prompt += `
Give general motivation only.
Do not personalize based on user feelings.
Example: "Keep going, you are doing great."
`;
    } else {
      prompt += `
Adapt to the user’s feelings.

Rules:
- If user is tired, be empathetic and suggest pacing
- If user asks about form, give 1 simple technique tip
- If user needs motivation, be energetic and supportive
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}\nUser: ${message}`,
    });

    console.log("Gemini raw response:", response);

    const reply =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini error details:", error);
    res.status(500).json({
      reply: "Error with AI response",
      error: String(error),
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});