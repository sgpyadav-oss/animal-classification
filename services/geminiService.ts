
import { GoogleGenAI, Type } from "@google/genai";
import { Detection } from "../types";

export const performObjectDetection = async (base64Image: string): Promise<Detection[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Clean up the base64 string (remove data:image/xxx;base64,)
  const imageData = base64Image.split(',')[1];

  const prompt = `Detect all significant objects in this image. For each object, provide a label, a confidence score between 0 and 1, and its bounding box. 
  The bounding box should be provided in [ymin, xmin, ymax, xmax] format, where coordinates are normalized integers from 0 to 1000.
  Respond strictly with the specified JSON structure.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageData
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: {
                type: Type.STRING,
                description: "The name of the detected object."
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence score (0.0 to 1.0)."
              },
              box_2d: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER },
                description: "[ymin, xmin, ymax, xmax] coordinates normalized to 0-1000."
              }
            },
            required: ["label", "confidence", "box_2d"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const detections: Detection[] = JSON.parse(response.text);
    return detections;
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    throw error;
  }
};
