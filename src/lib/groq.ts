
import { handleAppError } from './errors'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Types for the Groq response
interface GroqResponse {
    choices: {
        message: {
            content: string
        }
    }[]
    error?: {
        message: string
    }
}

export async function generateWithGroq<T>(prompt: string, schema: any): Promise<T> {
    if (!GROQ_API_KEY) {
        console.warn('Missing VITE_GROQ_API_KEY')
        throw new Error('Missing API Key')
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are a career guidance AI for Indian college students.
            You MUST respond in valid JSON only.

            Rules:
            - No markdown.
            - No explanations outside JSON.
            - No extra text before or after JSON.
            - Follow the exact schema provided.
            - If data is missing, return null for that field.
            - Keep responses realistic and actionable.

            Follow this JSON schema strictly: ${JSON.stringify(schema)}`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded')
            }
            const errData = await response.json().catch(() => ({}))
            throw new Error(errData.error?.message || response.statusText || 'AI request failed')
        }

        const data: GroqResponse = await response.json()

        if (data.error) {
            throw new Error(data.error.message)
        }

        const content = data.choices[0].message.content
        return JSON.parse(content) as T

    } catch (error: any) {
        // Classify and show user-friendly error (no service names exposed)
        if (error.message.includes('Rate limit')) {
            handleAppError({ error, context: 'ai.generate', errorCode: 'AI_RATE_LIMIT' })
        } else if (error.message.includes('Missing API Key')) {
            handleAppError({ error, context: 'ai.generate', errorCode: 'AI_UNAVAILABLE' })
        } else {
            handleAppError({ error, context: 'ai.generate', errorCode: 'AI_GENERATE' })
        }
        throw error
    }
}
