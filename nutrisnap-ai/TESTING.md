# Testing NutriSnap AI

## 1. Automated tests

From the project folder:

```
npm ci
npm test
```

Expected: `Test Files 9 passed (9)` and `Tests 61 passed (61)`.

| File | What it checks |
|---|---|
| `tests/nutrition.test.ts` | per-100 g scaling, meal and day totals, unknown fibre, energy split, input validation |
| `tests/foodData.test.ts` | unique ids, valid values, 4/4/9 calorie consistency, required Indian foods present, search and alias matching |
| `tests/targets.test.ts` | Mifflin-St Jeor maths, goal adjustments, protein varies by person, low-calorie warning, target validation |
| `tests/dates.test.ts` | local dates (no UTC shift), month and year boundaries, Monday week start |
| `tests/storage.test.ts` | save and load, corrupted data backup, invalid meals dropped, storage-full message, demo labelling |
| `tests/meals.test.ts` | draft validation, automatic meal names, editing keeps id, time-of-day category |
| `tests/photoAnalysis.test.ts` | AI off by default, file checks, demo is labelled, AI names mapped to food list, backend errors (mocked) |
| `tests/coach.test.ts` | question recognition, answers from saved data, suggestions, empty week |
| `tests/workflows.test.tsx` | full app: log a meal by hand and change grams, empty-meal validation, demo labelling, delete with confirmation, profile targets, data kept after reopening |

The same tests run on GitHub on every push (the "Run tests" step). A failing test stops the website from being published.

Also run before publishing:

```
npm run build
npm run preview
```

## 2. What was verified when this project was generated

Checked in the generator's Linux environment (Node 22, npm 11 for the lock file):

- `tsc -b` type check: no errors.
- `npm test`: 61 of 61 passed.
- `npm run build`: succeeded.
- `npm ci` with npm 10: succeeded.
- `npm audit`: 0 known vulnerabilities at the time.
- The built site was served from a sub-folder (like GitHub Pages) and opened in headless Chromium at 1280 px and 390 px widths: all pages rendered, navigation worked, and 25 demo meals were still present after a reload.

**Not verified** (you need to check these): Windows commands, a real GitHub Actions run, the published Pages URL, real phone cameras (Android and iPhone), HEIC photos, Safari and Firefox, Google Fonts loading, screen readers, and any AI backend.

## 3. Manual checklist

Use Chrome on a computer and a phone. Tick each row.

### Navigation and layout

| # | Steps | Expected |
|---|---|---|
| N1 | Open the site on a computer | Green sidebar with Home, Diary, Scan food, Progress, Coach, Profile |
| N2 | Open on a phone | Green top bar; bottom tab bar with a raised round camera button |
| N3 | Tap each tab | Correct page opens; the current tab is highlighted |
| N4 | On any page, press the browser Refresh button | Same page reloads, no 404 |
| N5 | Use Back and Forward in the browser | Moves between pages you visited |
| N6 | Press Tab repeatedly | A visible yellow focus outline moves through controls |

### Home

| # | Steps | Expected |
|---|---|---|
| H1 | Fresh browser (no data) | "Nothing logged today" with "Log your first meal"; placeholder-targets notice shown |
| H2 | Log a meal (see S-tests), return Home | Plate and bars show the meal's totals; meal listed |
| H3 | Delete the meal from Home (Delete, then Delete meal) | Meal gone, totals back to 0, "Meal deleted" message |

### Scan food

| # | Steps | Expected |
|---|---|---|
| S1 | Open Scan food | "AI photo analysis is not set up" notice. No "Analyse photo" button |
| S2 | Choose from gallery, pick a JPG | Preview appears with Replace and Remove buttons |
| S3 | Choose a PDF or text file (on a computer, switch the file dialog filter to "All files") | Error: "That file is not an image" |
| S4 | Open the picker, then cancel | Nothing changes, no error |
| S5 | Replace photo, then Remove photo | Preview changes, then disappears |
| S6 | Phone: Take photo | Camera opens; photo appears in preview |
| S7 | Add foods myself, search "roti", tap Chapati | Item added with 40 g and about 100 kcal |
| S8 | Change Chapati grams to 80 | Item and meal total kcal double immediately |
| S9 | Press + and − next to grams | Grams change by 5 or 10; totals update |
| S10 | Clear the grams box and press Save meal | Error "enter a serving between 1 and 3000 g"; nothing saved |
| S11 | Edit nutrition per 100 g, change protein | Badge changes to "Your values"; totals update |
| S12 | Add a custom food with all values | Added with "Your values" badge |
| S13 | Save meal | "Meal saved" message; Diary opens on that date showing the meal |
| S14 | Start again, press See a demo result | Purple "Demo result" notice; three items each labelled "Demo data" |
| S15 | Save the demo meal | Saved meal shows a "Demo data" label in Home and Diary |

### Diary

| # | Steps | Expected |
|---|---|---|
| D1 | Use the arrows and the date box | Moves between days; label shows Today/Yesterday or the date |
| D2 | Day with no meals | "No meals logged on this day" with Add a meal (date pre-filled) |
| D3 | Edit a meal, change grams and category, Save changes | Changes shown; totals updated; "Changes saved" |
| D4 | Edit a meal and change its date | Meal moves to the new date |
| D5 | Delete, then wait 5 seconds without confirming | Button returns to "Delete"; meal kept |
| D6 | Close the browser completely, reopen the site | All meals still there |

### Progress

| # | Steps | Expected |
|---|---|---|
| P1 | No data at all | "No meals to chart yet" |
| P2 | Profile > Load demo diary, open Progress | Two bar charts with a dashed target line, averages, target completion, energy split, weekly trends |
| P3 | Previous arrow | Earlier 7 days shown; next arrow returns; next is disabled on the current week |
| P4 | Add or delete a meal, return to Progress | Charts change to match |
| P5 | Phone width | Charts fit or scroll sideways inside their card; the page itself does not scroll sideways |

### Coach

| # | Steps | Expected |
|---|---|---|
| C1 | Open Coach | Notice that it is rule-based, not an AI chatbot |
| C2 | Tap each example question | Answers use your logged numbers |
| C3 | Ask "how much protein yesterday" | Answer refers to yesterday |
| C4 | Ask "hello" | Help message with example questions |

### Profile and data

| # | Steps | Expected |
|---|---|---|
| R1 | Estimate my targets with empty fields | List of what is missing |
| R2 | Age 30, height 175, weight 70, Male, moderate activity, Maintenance, Estimate | About 2,560 kcal and 84 g protein shown |
| R3 | Use these targets, then Save profile | "Profile saved"; Home notice about placeholders disappears; bars use new targets |
| R4 | Change goal to Muscle gain and re-estimate | Higher calories and protein |
| R5 | Set calories to 100 and Save | Error: calories must be between 800 and 6000 |
| R6 | Download backup | A `nutrisnap-backup-YYYY-MM-DD.json` file downloads |
| R7 | Delete all data, then Restore from backup with that file | Meals and profile come back |
| R8 | Restore with a non-JSON file | Error message; existing data unchanged |
| R9 | Load demo diary, then Remove demo meals | Demo meals removed; your own meals kept |

### Published site (GitHub Pages)

| # | Steps | Expected |
|---|---|---|
| G1 | Push to main | Actions run shows green ticks for build and deploy |
| G2 | Open `https://YOUR-USERNAME.github.io/REPO-NAME/` | App loads with styles and favicon |
| G3 | Refresh on `#/diary` | Diary reloads, no 404 |
| G4 | Repeat S2, S6, S13, D6 on a phone | All work |
