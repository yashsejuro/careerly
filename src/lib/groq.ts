import toast from 'react-hot-toast'

const API_URL = '/api/groq'

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
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                schema
            })
        })

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a moment.')
            }
            const errData = await response.json().catch(() => ({}))
            const errMsg = errData.error || response.statusText || 'Unknown Error'
            throw new Error(`Groq API Error: ${errMsg}`)
        }

        const data: GroqResponse = await response.json()

        if (data.error) {
            throw new Error(data.error.message)
        }

        const content = data.choices[0].message.content
        return JSON.parse(content) as T

    } catch (error: any) {
        console.error('Groq AI Error:', error)
        if (error.message.includes('Rate limit')) {
            toast.error('AI is busy (Rate Limit). Using cached data.')
        } else if (error.message.includes('Missing API Key')) {
            toast.error('AI Key missing. Using demo data.')
        } else {
            toast.error(`AI Error: ${error.message.slice(0, 50)}... Using fallback.`)
        }
        throw error
    }
}
