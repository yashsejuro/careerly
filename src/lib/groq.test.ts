import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateWithGroq } from './groq';

global.fetch = vi.fn();

describe('generateWithGroq', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call /api/groq with correct payload', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ result: 'success' })
          }
        }
      ]
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const prompt = 'test prompt';
    const schema = { type: 'object' };

    const result = await generateWithGroq(prompt, schema);

    expect(global.fetch).toHaveBeenCalledWith('/api/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        schema
      })
    });

    expect(result).toEqual({ result: 'success' });
  });

  it('should throw error if API returns error', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Some error' })
    });

    await expect(generateWithGroq('prompt', {})).rejects.toThrow('Groq API Error: Some error');
  });
});
