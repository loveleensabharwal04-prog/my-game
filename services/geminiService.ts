import { GoogleGenAI } from "@google/genai";

// As per guidelines, the API key MUST be provided via `process.env.API_KEY`.
// The application will not function correctly without it.
if (!process.env.API_KEY) {
  throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A generic function to generate content using the Gemini API.
 * This can be used for various in-game features.
 * @param prompt The text prompt to send to the model.
 * @returns The generated text content.
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a fallback or re-throw to be handled by the caller
    throw new Error("Failed to generate content from Gemini API.");
  }
}
