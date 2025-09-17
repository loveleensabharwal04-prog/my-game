
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
