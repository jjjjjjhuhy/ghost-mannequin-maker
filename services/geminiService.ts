
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getPrompt = (aspectRatio: string) => `
You are a highly specialized AI tool for photorealistic e-commerce image editing. Your sole purpose is to create a 'ghost mannequin' effect. You must NOT be creative or alter the original product's appearance in any way. Your work must be indistinguishable from a professional photo retouch.

Analyze this image of a model wearing clothing. Your task is to create a 'ghost mannequin' or 'invisible mannequin' effect with absolute precision, focusing on preserving the garment's exact structure, shape, pattern, and texture.

Follow these instructions with ZERO deviation:
1.  **Model Removal:** Remove the model's body completely. This includes any visible skin like the head, neck, arms, and legs.
2.  **Background Removal:** Remove the background entirely, making it transparent.
3.  **Photorealistic Reconstruction:** Intelligently reconstruct ONLY the inner parts of the clothing that were previously obscured by the model (e.g., the inside back of a collar, the lining of a jacket). This reconstruction must be based *entirely* on the visible parts of the garment.
4.  **ABSOLUTE Pattern & Texture Integrity:** This is the most critical instruction. You MUST NOT alter the garment's original pattern, texture, or fabric details in any way. When reconstructing hidden areas, the pattern must align perfectly and continue seamlessly from the visible parts. If the garment has a repeating pattern, you must replicate it exactly. DO NOT invent, modify, or hallucinate patterns or textures. The final output must be 100% faithful to the original fabric.
5.  **Structural Integrity & Shape:** This is equally critical. Preserve the garment's natural 3D shape, including its drape, folds, and silhouette as it was on the model. The reconstructed areas must realistically conform to the overall form. Avoid any distortion, warping, or unnatural flattening. The final product should look like it is on a perfectly formed, invisible body, not like a flat piece of clothing.
6.  **Strict Aspect Ratio:** The final output image canvas MUST have a precise aspect ratio of ${aspectRatio}. The garment should be centered and appropriately scaled within this canvas.
7.  **Final Output:** The final image must contain ONLY the clothing product, appearing as if it's on an invisible form, against a transparent background, on a canvas with the specified aspect ratio. The result should be a clean, professional, and photorealistic product image.

**CRITICAL: WHAT NOT TO DO**
- DO NOT change the color of the garment.
- DO NOT alter the pattern, texture, or fabric of the garment.
- DO NOT add any creative elements. Your job is technical, not artistic.
- DO NOT distort the shape or proportions of the clothing.
`;

export const createGhostMannequin = async (
  base64ImageData: string,
  mimeType: string,
  aspectRatio: string
): Promise<string | null> => {
  try {
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
            text: getPrompt(aspectRatio),
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    console.warn("No image part found in the Gemini response.");
    return null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image with Gemini API.");
  }
};
