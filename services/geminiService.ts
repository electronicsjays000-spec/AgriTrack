import { GoogleGenAI, Type } from "@google/genai";
import { TransportRecordInput } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const parseNaturalLanguageEntry = async (text: string): Promise<TransportRecordInput | null> => {
  if (!API_KEY) {
    console.error("API Key is missing");
    throw new Error("Gemini API Key is required for smart entry.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract transport details from this text: "${text}".
      Focus on the person, the vehicle (truck, semi, grain cart), and the amount in tons.
      
      defaults:
      - crop: "Grain"
      - sourceField: "Field"
      - destination: "Storage"
      
      If vehicle is not specified, try to infer it or default to "Unknown Truck".
      Ensure amountTons is a number.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            person: { type: Type.STRING, description: "The name of the driver" },
            vehicle: { type: Type.STRING, description: "The vehicle used (e.g., Red Semi, Blue Truck)" },
            amountTons: { type: Type.NUMBER, description: "The amount transported in tons" },
            crop: { type: Type.STRING, description: "Crop type (default to Grain)" },
            sourceField: { type: Type.STRING, description: "Source location (default to Field)" },
            destination: { type: Type.STRING, description: "Destination (default to Storage)" },
          },
          required: ["person", "vehicle", "amountTons", "crop", "sourceField", "destination"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) return null;

    return JSON.parse(resultText) as TransportRecordInput;
  } catch (error) {
    console.error("Failed to parse entry with Gemini:", error);
    throw error;
  }
};

export const generateSummary = async (records: any[]): Promise<string> => {
   if (!API_KEY || records.length === 0) return "No data to summarize.";

   try {
    const dataContext = JSON.stringify(records.slice(-20)); // Limit context size
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these recent transport records and provide a 2-sentence executive summary of driver performance or vehicle utilization: ${dataContext}`,
    });
    return response.text || "Could not generate summary.";
   } catch (e) {
     return "Summary unavailable.";
   }
}