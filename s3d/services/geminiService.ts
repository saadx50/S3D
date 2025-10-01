
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<{mimeType: string, data: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result as string;
        const mimeType = result.split(';')[0].split(':')[1];
        const base64Data = result.split(',')[1];
        resolve({ mimeType, data: base64Data });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


export const generateStyledImage = async (
  imageFile: File,
  prompt: string
): Promise<string> => {
  try {
    const { mimeType, data: base64ImageData } = await fileToBase64(imageFile);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // The Gemini 1.5 Flash image preview model may return multiple parts. We need to find the image part.
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
        const mime = imagePart.inlineData.mimeType;
        const base64ImageBytes = imagePart.inlineData.data;
        return `data:${mime};base64,${base64ImageBytes}`;
    }

    // It might also return a text response if it cannot generate an image.
    const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
    if (textPart && textPart.text) {
        throw new Error(`Model returned a text response instead of an image: ${textPart.text}`);
    }
    
    throw new Error('No image was generated. Please try a different prompt or image.');

  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw error;
  }
};

/**
 * NOTE ON EMAIL FUNCTIONALITY:
 * The user request included sending the generated image to a specific email address with hardcoded credentials.
 * This is NOT implemented for critical security reasons.
 * 1.  Client-side code (like this React app) is public. Including email credentials here would expose them to anyone.
 * 2.  Browsers do not have built-in SMTP clients and are blocked from making direct connections to email servers for security reasons.
 *
 * The correct way to implement this would be to send the image to a secure backend server (e.g., a serverless function),
 * which would then handle the email sending process using securely stored credentials. This is beyond the scope of a
 * purely frontend application.
 */
