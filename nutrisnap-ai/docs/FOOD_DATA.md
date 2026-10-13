# Food data: where the numbers come from and how to improve them

File: `src/data/foods.ts`. About 70 foods, values **per 100 g as eaten** (cooked where relevant).

## How the starter values were made

Each food has a `basis` note:

- **"Approx. USDA FoodData Central value"**: simple foods (cooked rice, egg, fruit, milk, nuts, oil). Values follow typical USDA figures but were written from general knowledge, not copied from a specific database record.
- **"Approx. IFCT 2017 / USDA value"**: foods common in Indian tables (idli, chapati, paneer, soya chunks, toned milk).
- **"Typical home-recipe estimate"**: mixed dishes (curries, dal, sambar, biryani, dosa, snacks). Calories were derived from protein, carbohydrate and fat using 4/4/9 kcal per gram for an assumed typical recipe. Real dishes vary widely, especially with oil and ghee.

None of these values has been independently verified. They are reasonable for everyday tracking, not for clinical use.

An automated test (`tests/foodData.test.ts`) checks that each food's calories agree with 4 × protein + 4 × carbs + 9 × fat within 15%. This catches typing mistakes, not wrong sources.

## How to verify a value

1. **Indian foods:** the Indian Food Composition Tables (IFCT 2017) from the National Institute of Nutrition, Hyderabad. Use the "cooked" or recipe values where available.
2. **Other foods:** USDA FoodData Central, <https://fdc.nal.usda.gov>. Search the food, prefer "Foundation" or "SR Legacy" entries, and read values per 100 g.
3. **Packaged foods:** the nutrition label on the packet (Indian labels give per 100 g).

Edit the numbers in `foods.ts`, update the `basis` text (for example `'IFCT 2017 code A001, checked 2026-11-02'`), then run `npm test`.

## How to add a food

Add a line in the right section of `FOODS`:

```ts
food('ragi-mudde', 'Ragi mudde', ['ragi ball', 'finger millet'], 'staples', [kcal, protein, carbs, fat, fibre], 150, '1 ball', RECIPE),
```

- `id`: lowercase words joined by hyphens, unique.
- `aliases`: other names people type, including regional names. These also help match names from a future AI service.
- The five numbers are per 100 g. Use `null` for fibre if unknown.
- Serving grams and label: what one typical portion weighs.

Run `npm test` afterwards; it checks ids are unique and values are sensible.

## Oil and ghee

A photo cannot show how much oil went into a curry. If you cooked with more than usual, add **Cooking oil** or **Ghee** as a separate item (1 teaspoon is about 5 g, about 45 kcal).

## Future: USDA lookup

USDA FoodData Central has a free API but it needs an API key (from api.data.gov). Like any key, it should be used from a backend, not from the website. `src/services/foodDatabase.ts` is the place to add it.
