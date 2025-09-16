
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const compareAnswers = async (question: string, answer1: string, answer2: string): Promise<boolean> => {
  const prompt = `Question: "${question}"
Answer 1: "${answer1}"
Answer 2: "${answer2}"
Are these two answers substantially similar or express the same core idea? Please answer with only the word "yes" or "no".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const textResponse = response.text.trim().toLowerCase();
    return textResponse.includes('yes');
  } catch (error) {
    console.error("Error comparing answers:", error);
    return false;
  }
};

export const generateDare = async (): Promise<string> => {
  const prompt = `Generate a fun, romantic, and safe-for-work dare for a couple playing a game. The dare should be something they can do right now, wherever they are. Be creative and keep it lighthearted.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating dare:", error);
    return "Give your partner a heartfelt 1-minute compliment without stopping.";
  }
};

export const generateTruth = async (): Promise<string> => {
  const prompt = `Generate a thoughtful, deep, and romantic "truth" question for a couple playing a game. The question should spark meaningful conversation and help them get to know each other on a deeper level.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating truth:", error);
    return "What's one small thing your partner does that always makes you smile?";
  }
};
