
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractTrainingData = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.split(',')[1] || base64Image,
              },
            },
            {
              text: "Extract training data from this screenshot. Look for duration (minutes), calories, average heart rate (HR), maximum heart rate, and training effect (usually a decimal like 3.0 or 4.1). If some values are missing, return null for them.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            duration: { type: Type.NUMBER, description: "Duration in minutes" },
            calories: { type: Type.NUMBER },
            avgHr: { type: Type.NUMBER },
            maxHr: { type: Type.NUMBER },
            effect: { type: Type.NUMBER },
          },
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini OCR error:", error);
    return null;
  }
};
