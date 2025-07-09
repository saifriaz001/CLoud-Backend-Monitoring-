// utils/geminiFlashPrompt.js
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // Make sure this is defined in your .env
});

/**
 * Run a Gemini prompt with optional tools like URL context
 * @param {string} promptText - The main text prompt for the model.
 * @param {Array} [tools=[]] - An array of tools to enable, e.g., [{ urlContext: {} }].
 */
export async function runGeminiFlashPrompt(promptText, tools = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Using Flash is good for this kind of task
      contents: [promptText],   // The prompt now goes inside an array
      tools: tools,             // Pass the tools configuration here
    });

    return response.text;
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    throw error;
  }
}