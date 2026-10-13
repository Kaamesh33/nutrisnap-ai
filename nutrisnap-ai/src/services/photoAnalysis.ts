import type { MealItem } from '../models/types';
import { newId } from '../utils/id';
import { bestMatch, getFoodById } from './foodDatabase';

/**
 * FOOD PHOTO ANALYSIS SERVICE
 * ---------------------------------------------------------------------
 * The app NEVER pretends to analyse a photo. There are three paths:
 *
 * 1. No AI service configured (the default): the person adds foods by hand.
 * 2. Demo: returns a FIXED sample meal, labelled as demo data everywhere.
 *    It does not look at the photo at all.
 * 3. Real AI: only when VITE_ANALYSIS_API_URL points to YOUR OWN backend
 *    (see docs/AI_BACKEND_PLAN.md). The backend returns food names and
 *    estimated grams. Nutrition numbers are then taken from the food list
 *    by deterministic code, never invented by the AI model.
 *
 * The real-AI path (analyzeWithBackend) has not been tested against a live
 * backend because none exists yet. Test it when you build the backend.
 * ---------------------------------------------------------------------
 */

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export type AnalysisMode = 'ai' | 'demo';

export interface AnalysisResult {
  mode: AnalysisMode;
  items: MealItem[];
  /** Names the AI returned that are not in the food list. */
  unmatched: string[];
}

/** What a backend must return: {"foods":[{"name":"idli","grams":120,"confidence":0.7}]} */
export interface DetectedFood {
  name: string;
  grams: number;
  confidence?: number;
}

export function analysisEndpoint(): string | null {
  const url = (import.meta.env.VITE_ANALYSIS_API_URL as string | undefined)?.trim();
  return url ? url : null;
}

export function isAiConfigured(): boolean {
  return analysisEndpoint() !== null;
}

/** Returns an error message for unusable files, or null when the file is fine. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'That file is not an image. Choose a JPG, PNG or WebP photo.';
  }
  if (file.size === 0) return 'That image file is empty. Choose another photo.';
  if (file.size > MAX_IMAGE_BYTES) {
    return `That photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. Choose one under 15 MB.`;
  }
  return null;
}

/** HEIC photos from iPhones may not preview outside Safari. */
export function mayNotPreview(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

/** Turns AI detections into meal items, using the food list for nutrition. */
export function mapDetections(foods: DetectedFood[]): { items: MealItem[]; unmatched: string[] } {
  const items: MealItem[] = [];
  const unmatched: string[] = [];
  for (const d of foods) {
    if (!d || typeof d.name !== 'string' || !d.name.trim()) continue;
    const grams = Number.isFinite(d.grams) && d.grams > 0 ? Math.min(Math.round(d.grams), 3000) : 100;
    const conf = typeof d.confidence === 'number' ? ` (confidence ${Math.round(d.confidence * 100)}%)` : '';
    const match = bestMatch(d.name);
    if (match) {
      items.push({
        id: newId(),
        foodId: match.id,
        name: match.name,
        grams,
        per100g: { ...match.per100g },
        source: 'ai-estimate',
        note: `AI saw "${d.name.trim()}"${conf}. Nutrition from the food list.`,
      });
    } else {
      unmatched.push(d.name.trim());
      items.push({
        id: newId(),
        foodId: null,
        name: d.name.trim(),
        grams,
        per100g: { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: null },
        source: 'ai-estimate',
        note: `Not in the food list${conf}. Enter nutrition values per 100 g, or remove it and search for a similar food.`,
      });
    }
  }
  return { items, unmatched };
}

/** Sends the photo to your own backend. Untested until a backend exists. */
export async function analyzeWithBackend(file: File, endpoint: string, timeoutMs = 45000): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const body = new FormData();
    body.append('image', file);
    const res = await fetch(endpoint, { method: 'POST', body, signal: controller.signal });
    if (!res.ok) throw new Error(`The analysis service replied with error ${res.status}. Try again or add foods by hand.`);
    const json = (await res.json()) as { foods?: DetectedFood[] };
    if (!json || !Array.isArray(json.foods)) throw new Error('The analysis service sent a reply the app cannot read.');
    const { items, unmatched } = mapDetections(json.foods);
    if (items.length === 0) throw new Error('No foods were recognised in this photo. Add foods by hand instead.');
    return { mode: 'ai', items, unmatched };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('The analysis took too long. Check your connection, then try again or add foods by hand.');
    }
    if (e instanceof TypeError) {
      throw new Error('Could not reach the analysis service. Check your connection or add foods by hand.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fixed demo meal. It ignores the photo entirely and every item is marked
 * as demo data so it can never be mistaken for real analysis.
 */
export function demoAnalysis(): AnalysisResult {
  const picks: Array<[string, number]> = [
    ['rice-white', 150],
    ['chicken-curry', 150],
    ['mixed-veg', 100],
  ];
  const items: MealItem[] = picks.map(([id, grams]) => {
    const f = getFoodById(id);
    if (!f) throw new Error(`Demo food ${id} missing from food list`);
    return {
      id: newId(),
      foodId: f.id,
      name: f.name,
      grams,
      per100g: { ...f.per100g },
      source: 'demo',
      note: 'Demo sample. Not detected from your photo.',
    };
  });
  return { mode: 'demo', items, unmatched: [] };
}
