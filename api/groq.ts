// @ts-nocheck
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { prompt, schema } = req.body;

  if (!prompt || !schema) {
    res.status(400).json({ error: 'Missing prompt or schema' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.error('Missing GROQ_API_KEY');
    res.status(500).json({ error: 'Server Configuration Error: Missing API Key' });
    return;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    });

    if (!response.ok) {
      if (response.status === 429) {
        res.status(429).json({ error: 'Rate limit exceeded. Please try again in a moment.' });
        return;
      }
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || response.statusText || 'Unknown Error';
      res.status(response.status).json({ error: `Groq API Error: ${errMsg}` });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Groq AI Error:', error);
    res.status(500).json({ error: error.message });
  }
}
