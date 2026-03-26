import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { participantId, sessionId, message, mode } = req.body;

    if (!message || !mode) {
      return res.status(400).json({ reply: "Missing message or mode" });
    }

    let prompt = `
You are an AI resistance-training coach assisting a user during squat exercise.

Rules:
- Keep responses very short (1-2 sentences)
- Be supportive, clear, and non-judgmental
- Do NOT give medical advice
- Focus on motivation and simple technique cues
`;

    if (mode === "generic") {
      prompt += `
Give general motivation only.
Do not personalize based on user feelings.
Example: "Keep going, you are doing great."
`;
    } else if (mode === "adaptive") {
      prompt += `
Adapt your response based on the user's input:

- If the user expresses fatigue, show empathy and suggest pacing
- If the user mentions form or technique, give one simple squat tip
- If the user seeks motivation, respond with strong encouragement
- Make the response feel natural and human-like
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}\n\nUser: ${message}`,
    });

    const reply = response.text || "No response from Gemini.";

    return res.status(200).json({
      reply,
      participantId: participantId || "unknown",
      sessionId: sessionId || "unknown",
    });
  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({
      reply: "Error with AI response",
      error: error?.message || "Unknown server error",
    });
  }
}