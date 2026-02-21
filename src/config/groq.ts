// src/config/groq.ts
// Groq AI configuration using OpenAI-compatible API
// Senior-level safe implementation

import OpenAI from "openai";

// Validate API Key at startup (important for debugging)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.warn("⚠️ VITE_GROQ_API_KEY is missing. AI features will be disabled.");
}

// Initialize Groq client only when key is present to avoid crashes
export const groqClient: OpenAI | null = GROQ_API_KEY
    ? new OpenAI({
          apiKey: GROQ_API_KEY,
          baseURL: "https://api.groq.com/openai/v1",
          dangerouslyAllowBrowser: true, // ⚠️ Only for development / hackathon
      })
    : null;

// Type for options
interface GroqOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

// Helper function to generate content using Groq
export async function generateWithGroq(
    prompt: string,
    options: GroqOptions = {}
): Promise<string> {
    try {
        if (!groqClient) {
            throw new Error("AI features are unavailable: VITE_GROQ_API_KEY is not set.");
        }

        if (!prompt || prompt.trim().length === 0) {
            throw new Error("Prompt is empty");
        }

        const response = await groqClient.chat.completions.create({
            model: options.model || "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024,
        });

        const content = response.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("Groq returned empty response");
        }

        return content;
    } catch (error: any) {
        console.error("❌ Error in generateWithGroq:", error?.message || error);
        throw new Error("Failed to generate response from Groq AI");
    }
}

// Available Groq models (for reference):
// - llama-3.3-70b-versatile (recommended for complex tasks)
// - llama-3.1-8b-instant (faster, smaller)
// - mixtral-8x7b-32768 (good balance)
// - gemma2-9b-it (Google's Gemma)
