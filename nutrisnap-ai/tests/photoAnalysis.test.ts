import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyzeWithBackend, demoAnalysis, isAiConfigured, mapDetections, validateImageFile } from '../src/services/photoAnalysis';

const file = (type: string, bytes = 10, name = 'meal.jpg') => new File([new Uint8Array(bytes)], name, { type });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('photo analysis service', () => {
  it('is not configured by default (no fake AI)', () => {
    expect(isAiConfigured()).toBe(false);
  });

  it('rejects non-images, empty and oversized files', () => {
    expect(validateImageFile(file('image/jpeg'))).toBeNull();
    expect(validateImageFile(file('application/pdf'))).toMatch(/not an image/);
    expect(validateImageFile(file('image/png', 0))).toMatch(/empty/);
    const big = file('image/jpeg');
    Object.defineProperty(big, 'size', { value: 16 * 1024 * 1024 });
    expect(validateImageFile(big)).toMatch(/under 15 MB/);
  });

  it('demo results are labelled demo and say they were not detected', () => {
    const r = demoAnalysis();
    expect(r.mode).toBe('demo');
    expect(r.items.every((i) => i.source === 'demo' && /not detected/i.test(i.note ?? ''))).toBe(true);
  });

  it('maps AI names to the food list; nutrition comes from the list, not the AI', () => {
    const { items, unmatched } = mapDetections([
      { name: 'idly', grams: 120, confidence: 0.8 },
      { name: 'unicorn stew', grams: 200 },
    ]);
    expect(items[0].foodId).toBe('idli');
    expect(items[0].source).toBe('ai-estimate');
    expect(items[0].per100g.kcal).toBe(135);
    expect(unmatched).toEqual(['unicorn stew']);
    expect(items[1].per100g.kcal).toBe(0);
  });

  it('calls the backend and handles errors (mocked fetch)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ foods: [{ name: 'sambar', grams: 150 }] }), { status: 200 })),
    );
    const r = await analyzeWithBackend(file('image/jpeg'), 'https://example.test/analyze');
    expect(r.mode).toBe('ai');
    expect(r.items[0].foodId).toBe('sambar');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 500 })));
    await expect(analyzeWithBackend(file('image/jpeg'), 'https://example.test/analyze')).rejects.toThrow(/error 500/);
  });
});
