import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../constants';
import { GroundingMetadata, CandidateWithGrounding } from "../types";

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * This prevents the app from crashing on load if the API key is not set.
 */
const getAi = (): GoogleGenAI => {
    if (!ai) {
        // This will throw if API_KEY is missing or invalid, and it will be caught by the calling function.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const aiInstance = getAi();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text from Gemini:", error);
    return "Error generating content. Please try again later.";
  }
};

export const generateTextWithJsonOutput = async <T,>(prompt: string, systemInstruction?: string): Promise<T | null> => {
  try {
    const aiInstance = getAi();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        ...(systemInstruction && { systemInstruction }),
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    try {
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      console.error("Failed to parse JSON response:", e, "Raw response:", jsonStr);
      return null;
    }
  } catch (error) {
    console.error("Error generating JSON from Gemini:", error);
    return null;
  }
};

export const generateTextWithGoogleSearch = async (prompt: string): Promise<{ text: string; groundingMetadata?: GroundingMetadata }> => {
  try {
    const aiInstance = getAi();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const candidate = response.candidates?.[0] as CandidateWithGrounding | undefined;
    return { text: response.text, groundingMetadata: candidate?.groundingMetadata };
  } catch (error) {
    console.error("Error generating text with Google Search from Gemini:", error);
    return { text: "Error generating content with search. Please try again later." };
  }
};


export const createChat = (systemInstruction: string): Chat => {
  const aiInstance = getAi();
  return aiInstance.chats.create({
    model: GEMINI_TEXT_MODEL,
    config: { systemInstruction },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
   return await chat.sendMessageStream({ message });
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const aiInstance = getAi();
    const response = await aiInstance.models.generateImages({
        model: GEMINI_IMAGE_MODEL,
        prompt: prompt,
        config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image from Gemini:", error);
    return null;
  }
};