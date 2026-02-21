import { describe, it, expect, vi, beforeEach } from 'vitest';
import { careerlyApi } from './api';
import * as groqModule from './groq';

vi.mock('./groq', () => ({
  generateWithGroq: vi.fn()
}));

describe('careerlyApi.ai.generateObject', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call generateWithGroq without checking VITE_GROQ_API_KEY', async () => {
    (groqModule.generateWithGroq as any).mockResolvedValue({ some: 'data' });

    const prompt = 'test prompt';
    const schema = {};

    const result = await careerlyApi.ai.generateObject({ prompt, schema });

    expect(groqModule.generateWithGroq).toHaveBeenCalledWith(prompt, schema);
    expect(result).toEqual({ object: { some: 'data' } });
  });

  it('should fallback to mock if generateWithGroq fails', async () => {
    (groqModule.generateWithGroq as any).mockRejectedValue(new Error('API failed'));

    const prompt = 'test prompt';
    const schema = { properties: { summary: true } }; // trigger fallback D

    const result = await careerlyApi.ai.generateObject({ prompt, schema });

    expect(groqModule.generateWithGroq).toHaveBeenCalled();
    expect(result.object).toHaveProperty('summary');
  });
});
