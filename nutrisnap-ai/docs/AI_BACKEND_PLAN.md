# Optional plan: real AI food-photo analysis

Status: **not built**. Nothing in this document is required to use NutriSnap AI. Read it fully before creating any paid account.

## 1. Why a backend is required

The website on GitHub Pages is public static files. Anything inside it, including every `VITE_` environment variable, can be read by anyone who opens the site. An AI provider's API key placed there would be copied and used at your expense.

So the key must live on a small server that you control:

```
Phone or browser                Your backend (serverless function)          AI provider
(GitHub Pages site)             holds the secret API key                    (vision model)
     |  POST photo  -------------->  checks origin, size, type, rate  ------->  "list the foods
     |                               limit; adds the secret key                  and grams as JSON"
     |  <------- {"foods":[...]} ---  validates the JSON reply  <-------------
     |
     v
App maps food names to its own food list and calculates nutrition itself.
```

The AI is only asked **which foods** and **roughly how many grams**. Calories, protein and the rest are still calculated by the app's deterministic code from the food list, so the model cannot invent nutrition numbers. Results are labelled "AI estimate" and the person must review them before saving.

## 2. The contract the app already expects

The frontend code is in `src/services/photoAnalysis.ts` (`analyzeWithBackend`). It is written but **untested against a real backend**, because none exists yet.

Request: `POST` to your URL, body `multipart/form-data` with one field named `image` (the photo file).

Successful response (HTTP 200, JSON):

```json
{ "foods": [ { "name": "idli", "grams": 120, "confidence": 0.7 },
             { "name": "sambar", "grams": 150, "confidence": 0.6 } ] }
```

Any non-200 status is shown to the person as an error and they can continue by adding foods by hand. Names that do not match the food list are shown as "Not in the food list" with zero nutrition until the person fills them in.

To switch it on, set the backend's public URL (this is not a secret) when building:

- Local testing: create `.env.local` containing `VITE_ANALYSIS_API_URL=https://your-worker.your-name.workers.dev/analyze`, then `npm run dev`.
- Published site: add `env: VITE_ANALYSIS_API_URL: https://...` to the **Build** step in `.github/workflows/deploy.yml`.

## 3. Choices, accounts and costs

Prices and free allowances change often. The figures below are rough expectations based on information available up to mid-2026. **Check each provider's current pricing page before signing up.**

### Where to run the backend

| Option | Account needed | Cost for personal use | Notes |
|---|---|---|---|
| Cloudflare Workers | Free Cloudflare account | Free plan has had a generous daily request allowance (about 100,000 requests a day) | Simple, fast, secrets stored with `wrangler secret put`. Starter code below. |
| Vercel or Netlify functions | Free account | Free hobby tiers | Good if you prefer their dashboards. |
| Google Cloud Run | Google Cloud account with billing enabled | Free monthly allowance, card required | More setup; more control. |

### Which AI model

| Provider | Account needed | Cost per photo (rough) | Notes |
|---|---|---|---|
| Anthropic Claude API | Account at console.anthropic.com with prepaid credits or billing | Roughly a fraction of a US cent to about one cent per photo for a small or mid-size model | **A Claude Pro subscription does not include API credits**; API use is billed separately. Model names and prices: docs.claude.com. |
| Google Gemini API | Google account, API key from AI Studio | Has offered a free tier with rate limits; paid tier per token | Check whether free-tier data may be used to improve Google's products before sending personal photos. |
| OpenAI API | OpenAI account with billing | Per token | Similar setup. |

For one person logging three meals a day, cost is usually small, but **set a monthly spending limit** in the provider console and add rate limiting in your backend so a leaked URL cannot run up a bill.

### Privacy

Meal photos leave the device and are processed by the AI provider. Tell anyone else who uses your copy of the app. Do not log or store photos in the backend unless you need to.

## 4. Starter backend: Cloudflare Worker + Claude (untested)

This is a starting point, not finished production code. It has **not** been run. Read it, deploy it to a test URL, and test it with the app before relying on it.

One-time setup (in a new folder, separate from the website):

```
npm create cloudflare@latest nutrisnap-analyzer
cd nutrisnap-analyzer
npx wrangler secret put ANTHROPIC_API_KEY
```

Set `ALLOWED_ORIGIN` in `wrangler.toml` (or `wrangler.jsonc`) under `[vars]` to your site origin, for example `https://your-name.github.io` (no path, no trailing slash). Replace `src/index.js` with:

```js
// NutriSnap AI analyzer - Cloudflare Worker (starter, untested)
// Secrets: ANTHROPIC_API_KEY (wrangler secret put). Vars: ALLOWED_ORIGIN.
const MODEL = 'claude-haiku-5-5'; // check docs.claude.com for current model names and prices
const MAX_BYTES = 5 * 1024 * 1024; // provider image size limit; resize larger photos first
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const PROMPT = `You are identifying foods in a photo of a meal, usually Indian home food.
Return ONLY JSON, no other text, in this exact shape:
{"foods":[{"name":"<common English or Indian name>","grams":<estimated grams as a number>,"confidence":<0 to 1>}]}
List each separate food once (for example rice, sambar, poriyal, curd). Estimate the edible portion in grams.
Do not give calories or nutrients. If no food is visible, return {"foods":[]}.`;

function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(env) } });
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });
    if (request.method !== 'POST') return json({ error: 'Use POST' }, 405, env);
    if (request.headers.get('Origin') !== env.ALLOWED_ORIGIN) return json({ error: 'Origin not allowed' }, 403, env);

    // TODO before real use: add rate limiting (for example Cloudflare's rate limiting rules).

    let file;
    try {
      file = (await request.formData()).get('image');
    } catch {
      return json({ error: 'Expected multipart form data' }, 400, env);
    }
    if (!file || typeof file === 'string') return json({ error: 'No image field' }, 400, env);
    if (!TYPES.includes(file.type)) return json({ error: 'Unsupported image type' }, 415, env);
    if (file.size > MAX_BYTES) return json({ error: 'Image too large' }, 413, env);

    const ai = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: file.type, data: toBase64(await file.arrayBuffer()) } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
    });
    if (!ai.ok) return json({ error: 'AI service error' }, 502, env);

    const data = await ai.json();
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      return json({ error: 'Could not read AI reply' }, 502, env);
    }
    const foods = Array.isArray(parsed.foods)
      ? parsed.foods
          .filter((f) => f && typeof f.name === 'string' && Number.isFinite(Number(f.grams)))
          .slice(0, 12)
          .map((f) => ({
            name: f.name.slice(0, 60),
            grams: Math.min(3000, Math.max(1, Math.round(Number(f.grams)))),
            confidence: Number.isFinite(Number(f.confidence)) ? Math.min(1, Math.max(0, Number(f.confidence))) : undefined,
          }))
      : [];
    return json({ foods }, 200, env);
  },
};
```

Deploy with `npx wrangler deploy`. It prints a URL such as `https://nutrisnap-analyzer.your-name.workers.dev`. The Worker answers on any path, so use that URL as `VITE_ANALYSIS_API_URL`.

## 5. Frontend work still needed before going live

1. **Resize photos in the browser** before upload (for example to 1600 px on the long side, JPEG quality 0.85). Phone photos are often larger than the provider's per-image limit. The app currently accepts up to 15 MB and sends the original.
2. Test `analyzeWithBackend` with the real backend: success, slow network, error responses, unknown foods.
3. Add more foods to the food list so AI names match more often (see `docs/FOOD_DATA.md`).
4. Consider a confidence threshold and a short "Why these foods?" note in the review screen.
