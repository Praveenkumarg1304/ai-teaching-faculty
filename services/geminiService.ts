
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  private static model = 'gemini-3-pro-preview';

  static async getDiagnosticResponse(userMessage: string, history: any[]) {
    const response = await ai.models.generateContent({
      model: this.model,
      contents: [
        { role: 'user', parts: [{ text: `History: ${JSON.stringify(history)}\n\nUser Question: ${userMessage}` }] }
      ],
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nYou are currently acting as Dr. Aris (DIAGNOSTICIAN). Analyze the student's request. Ask 2-3 specific diagnostic questions to gauge their current level. Do NOT teach yet.`,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });
    return response.text;
  }

  static async generateLessonPlan(topic: string) {
    const response = await ai.models.generateContent({
      model: this.model,
      contents: `Design a 3-step lesson plan for the topic: ${topic}`,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nYou are Prof. Lyra (ARCHITECT). Return a JSON lesson plan.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["title", "content"]
              }
            }
          },
          required: ["topic", "objectives", "steps"]
        },
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse lesson plan", e);
      return null;
    }
  }

  static async getComprehensiveTeaching(topic: string, plan: any) {
    const response = await ai.models.generateContent({
      model: this.model,
      contents: `Teach me according to this plan: ${JSON.stringify(plan)}`,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nThis is a team effort. First, Mentor Sam (EXPLAINER) writes the lesson. Then, Inspector Vane (CRITIC) reviews it and improves it. Finally, output only the REFINED explanation. Use clear Markdown and bold key terms.`,
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });
    return response.text;
  }
}
