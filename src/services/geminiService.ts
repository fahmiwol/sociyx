/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCaption(topic: string, platform: string, tone: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [{ text: `Generate a creative social media caption for ${platform} about: ${topic}. The tone should be ${tone}. Language: Indonesian. Include relevant emojis and 3-5 hashtags.` }]
        }
      ],
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating caption:", error);
    throw error;
  }
}

export async function generateImagePrompt(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [{ text: `Create a highly detailed, professional photography prompt for an AI image generator based on this social media topic: ${topic}. Focus on lighting, composition, and mood appropriate for high-end brand assets. Language: English.` }]
        }
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error generating image prompt:", error);
    throw error;
  }
}

// Simulated Image Generation (Placeholder since real image gen often requires specific setup or Imagen API)
export async function generateImage(prompt: string) {
  // In a real app, this would call gemini-2.5-flash-image or Imagen
  // For this demo, we'll return a seeded picsum URL or simulated result
  const seed = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${seed}/1024/1024`;
}
