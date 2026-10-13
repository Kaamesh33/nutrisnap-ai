# NutriSnap AI

**Snap it. Track it. Improve it.**

NutriSnap AI is a nutrition tracker for Indian and homemade meals. You log what you ate, adjust the portion in grams, and the app adds up calories, protein, carbohydrates, fat and fibre against your daily targets. It runs entirely in the browser and can be hosted for free on GitHub Pages.

Built with React 18, TypeScript, Vite and plain CSS. No paid services, no login, no server.

---

## Contents

1. [What works in this version](#1-what-works-in-this-version)
2. [Important limits](#2-important-limits)
3. [Install the tools (Windows, one time)](#3-install-the-tools-windows-one-time)
4. [Run the app on your computer](#4-run-the-app-on-your-computer)
5. [Put the project on GitHub](#5-put-the-project-on-github)
6. [Publish the website with GitHub Pages](#6-publish-the-website-with-github-pages)
7. [Test the published website](#7-test-the-published-website)
8. [Making changes later](#8-making-changes-later)
9. [Troubleshooting](#9-troubleshooting)
10. [Project structure](#10-project-structure)
11. [How the numbers are calculated](#11-how-the-numbers-are-calculated)
12. [Adding real AI photo analysis later](#12-adding-real-ai-photo-analysis-later)

---

## 1. What works in this version

- **Home dashboard.** "Today's plate" shows calories on the plate rim and protein, carbs, fat and fibre in four bowls, plus progress bars, protein remaining and today's meals.
- **Scan food.** Take a photo or choose one, preview, replace or remove it. Then add foods from a searchable list of about 70 Indian foods (or a custom food), set the grams, and save.
- **Live recalculation.** Changing grams or nutrition values updates the item and meal totals immediately.
- **Food diary.** View any date, edit meals, delete meals (with confirmation), see daily totals by breakfast, lunch, dinner and snacks.
- **Progress.** Daily calorie and protein charts against targets, averages, target completion, energy split from protein, carbs and fat, and 8-week trends.
- **Nutrition coach.** Answers questions such as "How many calories remain?" from your saved diary using fixed rules. It is clearly labelled as not an AI chatbot.
- **Profile and targets.** Estimates targets from age, sex, height, weight, activity and goal; every target is editable.
- **Your data.** Saved in this browser. Download a backup, restore from a backup, load or remove a demo diary, delete everything.

## 2. Important limits

- **No AI photo analysis yet.** The app tells you this and never pretends to read your photo. "See a demo result" fills in a fixed sample meal that is labelled "Demo data" everywhere. See section 12 for adding real AI.
- **Food values are approximate.** The built-in list was compiled from general knowledge of USDA FoodData Central and India's IFCT 2017 tables plus typical home recipes. It was not copied line by line from those databases. Every item shows a "Food list (approx.)" label. See `docs/FOOD_DATA.md` to check and improve values.
- **Data stays in one browser.** Meals saved in Chrome on your laptop do not appear on your phone. Clearing browser data deletes them. Use **Profile > Download backup** regularly.
- **Photos are not saved.** The photo is only shown while you log the meal.
- **Targets are estimates, not medical advice.**

## 3. Install the tools (Windows, one time)

You need two free programs.

### 3.1 Node.js 24 LTS

1. Go to <https://nodejs.org> and download the **LTS** installer for Windows (version 24 or newer).
2. Run it and accept the defaults.
3. Open a **new** Command Prompt (press the Windows key, type `cmd`, press Enter) and run:

   ```
   node --version
   npm --version
   ```

   You should see something like `v24.x.x` and `11.x.x`. If `npm` shows 10.x, that still works as long as you use `npm ci` (not `npm install`) in section 4.

### 3.2 Git

1. Go to <https://git-scm.com/download/win>, download and install with the default options.
2. In a new Command Prompt, run `git --version`. You should see `git version 2.x`.

### 3.3 A code editor (optional but recommended)

Install VS Code from <https://code.visualstudio.com>. You can open the project folder in it with **File > Open Folder**.

## 4. Run the app on your computer

1. Unzip `nutrisnap-ai.zip` somewhere simple, for example `C:\Projects\nutrisnap-ai`. Make sure the folder you end up with contains `package.json` directly inside it (not another `nutrisnap-ai` folder inside).
2. Open Command Prompt and go into the folder:

   ```
   cd C:\Projects\nutrisnap-ai
   ```

3. Install the exact dependency versions from `package-lock.json`:

   ```
   npm ci
   ```

   This takes one or two minutes and creates a `node_modules` folder. Expected ending: `added NNN packages` and `found 0 vulnerabilities`.

4. Start the app:

   ```
   npm run dev
   ```

   Expected output includes `Local: http://localhost:5173/`. Hold **Ctrl** and click that link, or paste it into Chrome. Press **Ctrl + C** in Command Prompt to stop.

5. Optional checks (run these from the same folder):

   ```
   npm test
   npm run build
   npm run preview
   ```

   - `npm test` runs 61 automated tests. Expected: `Test Files 9 passed` and `Tests 61 passed`.
   - `npm run build` creates the production website in `dist`. Expected: `✓ built in ...`.
   - `npm run preview` serves that production build at `http://localhost:4173/`.

**Try it on your phone on the same Wi-Fi:** run `npm run dev -- --host` and open the `Network:` address it prints on your phone. Windows may ask to allow Node.js through the firewall; allow it on private networks.

## 5. Put the project on GitHub

Create a free account at <https://github.com> if you do not have one.

### 5.1 Create an empty repository

1. Click **+** (top right) > **New repository**.
2. Repository name: `nutrisnap-ai` (any name works; the app does not depend on it).
3. Choose **Public**. GitHub Pages is free for public repositories on free accounts.
4. Do **not** tick "Add a README", ".gitignore" or "license". The project already has them.
5. Click **Create repository**. Keep the page open; it shows your repository address, for example `https://github.com/YOUR-USERNAME/nutrisnap-ai.git`.

### 5.2 Upload the files with Git (recommended)

In Command Prompt, inside the project folder (`C:\Projects\nutrisnap-ai`):

```
git init
git add .
git commit -m "First version of NutriSnap AI"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nutrisnap-ai.git
git push -u origin main
```

Replace `YOUR-USERNAME`. The first push opens a browser window to sign in to GitHub; approve it.

If `git commit` says "Please tell me who you are", run these once, then repeat the commit and push:

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

`.gitignore` stops `node_modules`, `dist` and `.env` files from being uploaded. That is intended.

### 5.3 Alternative: upload in the browser

On the empty repository page, click **uploading an existing file**, then drag the **contents** of the project folder (not the folder itself) into the page and click **Commit changes**.

Afterwards, check that these exist in the repository: `package.json`, `package-lock.json`, `src/`, `tests/`, and **`.github/workflows/deploy.yml`**. If the `.github` folder is missing, create it by hand: **Add file > Create new file**, type the name `.github/workflows/deploy.yml`, paste the contents of that file from your computer, and commit. Never upload `node_modules`.

## 6. Publish the website with GitHub Pages

The file `.github/workflows/deploy.yml` tells GitHub to install, test, build and publish the site every time you push to `main`.

1. In your repository, open **Settings > Pages**.
2. Under **Build and deployment > Source**, choose **GitHub Actions**. (There is nothing else to fill in.)
3. Open the **Actions** tab. If the "Deploy to GitHub Pages" run failed before you changed the setting, click it and choose **Re-run all jobs**. Otherwise push any change or click **Run workflow**.
4. Wait for a green tick (about 1 to 3 minutes). Click the run; the **deploy** box shows your address, normally:

   ```
   https://YOUR-USERNAME.github.io/nutrisnap-ai/
   ```

### About the Vite base path

GitHub Pages serves project sites from a sub-folder (`/nutrisnap-ai/`). Normally you must set Vite's `base` to that folder name. This project avoids that step: `vite.config.ts` uses a relative base (`./`) and the app uses `#/` addresses (for example `/#/diary`), so it works under **any** repository name and refreshing a page never gives a 404.

If you ever switch to normal (non-#) addresses, you must set an absolute base. You can do that without editing code by setting an environment variable when building, for example in the workflow's Build step:

```yaml
      - name: Build
        run: npm run build
        env:
          VITE_BASE: /nutrisnap-ai/
```

Both slashes are required.

### GitHub Pages hosts files only

GitHub Pages serves static files (HTML, CSS, JavaScript). It cannot run server code and **cannot keep secrets**: anything in the website, including any `VITE_` environment variable, can be read by anyone. Never put an API key in this project. See section 12.

## 7. Test the published website

1. Open your Pages address in Chrome on your computer and on your phone.
2. Go through the checklist in `TESTING.md`, at minimum: log a meal, change grams, save, reload the page, and check the meal is still there.
3. On a phone, check that **Take photo** opens the camera and **Choose from gallery** opens your photos.
4. If the page is blank, see section 9.

Tip: on a phone, use the browser's **Add to Home screen** to open it like an app. Data saved there may be separate from data saved in the normal browser tab.

## 8. Making changes later

After editing files:

```
npm test
npm run build
git add .
git commit -m "Describe what you changed"
git push
```

The website updates automatically a few minutes after the push. If the Actions run turns red, open it to see which step failed (tests or build) and fix that first.

## 9. Troubleshooting

| What you see | Likely cause | What to do |
|---|---|---|
| `'node' is not recognized` or `'npm' is not recognized` | Node.js not installed, or Command Prompt opened before installing | Install Node.js 24 LTS, close and reopen Command Prompt. |
| PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled` | PowerShell security setting | Use Command Prompt (`cmd`) instead, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` in PowerShell once. |
| `npm error Cannot read properties of null (reading 'edgesOut')` | Older npm (10.x) bug when running `npm install` | Use `npm ci` instead, or update npm with `npm install -g npm@11`. |
| `npm ci` says `package-lock.json` is missing or out of sync | Lock file not copied, or `package.json` edited | Make sure `package-lock.json` is in the folder. If you changed dependencies on purpose, run `npm install` once (with npm 11) and commit the new lock file. |
| `'vite' is not recognized` | Dependencies not installed in this folder | Run `npm ci` in the folder that contains `package.json`. |
| `Port 5173 is in use` | Another dev server is running | Close the other Command Prompt window, or use the different port Vite offers. |
| Actions run fails at **Deploy** with "Get Pages site failed" or 404 | Pages source not set | Settings > Pages > Source: **GitHub Actions**, then re-run the workflow. |
| Actions run fails at **Run tests** | A test failed after a code change | Open the step log, read the failing test name, run `npm test` locally and fix it. |
| Actions run fails at **Install dependencies** | `package-lock.json` missing or out of date | See the `npm ci` row above. |
| Published page is blank | Usually a JavaScript error, or files uploaded into a sub-folder | Press F12 > Console and read the red error. Check that `index.html` is at the top level of the repository, not inside another folder. |
| Published page shows the README instead of the app | Pages source set to "Deploy from a branch" | Change the source to **GitHub Actions**. |
| Fonts look plain | Google Fonts blocked by the network | Harmless; the app falls back to system fonts. |
| Meals disappeared | Different browser or device, private window, or browser data cleared | Data is per browser. Restore a backup from **Profile > Restore from backup**. |
| "Browser storage is full" | Many meals in local storage (limit is usually about 5 MB) | Download a backup, remove demo meals or old meals. |
| Camera button opens files instead of the camera | Desktop browser, or the phone browser ignores the camera hint | Expected on computers. On phones, choose from gallery instead. |
| An iPhone photo shows no preview | HEIC format outside Safari | You can still log the meal; or set the iPhone camera to "Most Compatible". |

## 10. Project structure

```
nutrisnap-ai/
  index.html                  page shell, fonts, favicon
  package.json                scripts and exact dependency versions
  package-lock.json           locked versions used by npm ci and GitHub Actions
  vite.config.ts              build settings, base path, test settings
  tsconfig*.json              TypeScript settings (strict mode)
  .env.example                the only setting: optional public URL of YOUR backend
  .gitignore
  .github/workflows/deploy.yml  test, build and publish to GitHub Pages
  public/favicon.svg
  docs/
    AI_BACKEND_PLAN.md        how to add real photo analysis safely, costs
    FOOD_DATA.md              where food values come from, how to verify and add foods
  CLAUDE.md                   notes for future AI-assisted coding sessions
  TESTING.md                  automated and manual test checklist
  src/
    main.tsx                  starts React
    App.tsx                   chooses the page from the #/ address
    models/                   data types and placeholder defaults
    data/foods.ts             the food reference list (per 100 g)
    data/demoDiary.ts         sample week, always labelled as demo
    services/
      foodDatabase.ts         search and lookup
      storage.ts              save, load, validate, backup format
      photoAnalysis.ts        image checks, demo result, optional backend call
      coach.ts                rule-based coach answers
    utils/
      nutrition.ts            all nutrition arithmetic
      targets.ts              target estimates
      meals.ts, dates.ts, format.ts, id.ts
    hooks/
      useAppStore.tsx         app data, saved after every change
      useHashRoute.ts         tiny #/ router
    components/               reusable UI pieces (plate graphic, bars, editor, charts...)
    pages/                    Home, Scan, Diary, Edit meal, Progress, Coach, Profile
    styles/global.css         design tokens and all styles
  tests/                      unit and workflow tests (Vitest + Testing Library)
```

## 11. How the numbers are calculated

All nutrition maths is in `src/utils/nutrition.ts` and covered by tests.

- Each food stores values **per 100 g**.
- For each food: `nutrient = per-100 g value × grams ÷ 100`, done separately for calories, protein, carbohydrates, fat and fibre.
- Meal total = sum of its foods. Day total = sum of that day's meals.
- Fibre that is unknown stays "unknown" rather than counting as zero, and the app tells you when a total is incomplete.
- Each food shows where its numbers came from: **Food list (approx.)**, **Your values** (you edited them), **AI estimate** (from a future AI service), or **Demo data**.

Targets (`src/utils/targets.ts`): Mifflin-St Jeor resting energy × an activity factor, then −20% for fat loss or +10% for muscle gain; protein 1.0 to 1.8 g per kg depending on goal and activity; fat 25% of energy; carbohydrates fill the rest; fibre 14 g per 1,000 kcal. These are common starting points, not prescriptions.

## 12. Adding real AI photo analysis later

The app is ready for it, but it needs a small server that you control, because the AI provider's API key must never be in the website. Read `docs/AI_BACKEND_PLAN.md` before signing up for anything. It explains the architecture, costs, privacy, and gives starter backend code.

Once a backend is running, set its public address (not a key) as `VITE_ANALYSIS_API_URL` in a `.env.local` file for local testing, or as an environment variable in the workflow's Build step for the published site. The **Analyse photo** button then appears; results are labelled "AI estimate", and the nutrition numbers still come from the food list, not from the AI.

---

NutriSnap AI gives estimates for everyday tracking. It is not a medical device and does not give medical advice.
