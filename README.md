# Kishore Vijay — Portfolio

Terminal-style animated React portfolio. Green techy aesthetic with matrix rain, glitch effects, morphing avatar, typing animation, and scroll-reveal cards.

---

## 📁 Folder Structure

```
kishore-portfolio/
├── public/
│   └── index.html             ← HTML shell + Google Fonts
├── src/
│   ├── components/
│   │   ├── Cursor.js          ← Custom green glow cursor
│   │   ├── MatrixCanvas.js    ← Animated matrix rain background
│   │   ├── Particles.js       ← Floating green particles
│   │   ├── Navbar.js / .css   ← Sticky navigation bar
│   │   ├── Hero.js / .css     ← Hero section + terminal widget
│   │   ├── StatsRow.js / .css ← Animated counter stats
│   │   ├── About.js / .css    ← About + morphing avatar
│   │   ├── Projects.js / .css ← 6 project cards
│   │   ├── Skills.js / .css   ← Animated skill bars + badges
│   │   ├── Contact.js / .css  ← Contact links
│   │   └── Footer.js / .css   ← Footer
│   ├── styles/
│   │   └── global.css         ← CSS variables, animations, resets
│   ├── App.js                 ← Root component
│   └── index.js               ← React entry point
├── netlify.toml               ← Netlify config
├── vercel.json                ← Vercel config
├── .gitignore
└── package.json
```

---

## 🚀 Local Setup

### Step 1 — Install Node.js
Download from https://nodejs.org (use LTS version)

### Step 2 — Install dependencies
```bash
cd kishore-portfolio
npm install
```

### Step 3 — Run locally
```bash
npm start
```
Opens at http://localhost:3000

### Step 4 — Build for production
```bash
npm run build
```
Creates a `build/` folder ready to deploy.

---

## 🌐 Deploy to Internet (3 Free Options)

---

### Option A — Netlify (Easiest, Recommended)

1. Go to https://netlify.com → Sign up free
2. Click **"Add new site" → "Deploy manually"**
3. Run `npm run build` locally
4. Drag and drop the `build/` folder into Netlify
5. ✅ Live instantly at `yourname.netlify.app`

**OR connect GitHub for auto-deploy:**
1. Push your code to GitHub (see GitHub section below)
2. Netlify → "Import from Git" → Connect GitHub → Select repo
3. Build command: `npm run build`
4. Publish directory: `build`
5. Click Deploy → Auto-deploys on every push!

---

### Option B — Vercel

1. Go to https://vercel.com → Sign up free with GitHub
2. Click **"New Project"** → Import your GitHub repo
3. Framework: **Create React App** (auto-detected)
4. Click **Deploy**
5. ✅ Live at `yourname.vercel.app`

Auto-deploys on every git push automatically.

---

### Option C — GitHub Pages

1. In `package.json`, add this line inside the top-level object:
   ```json
   "homepage": "https://kishorevijay07.github.io/kishore-portfolio"
   ```
2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add these scripts to `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
4. Run:
   ```bash
   npm run deploy
   ```
5. Go to GitHub repo → Settings → Pages → Source: `gh-pages` branch
6. ✅ Live at `https://kishorevijay07.github.io/kishore-portfolio`

---

## 📤 Push to GitHub (Required for Netlify/Vercel auto-deploy)

```bash
# Inside the kishore-portfolio folder:
git init
git add .
git commit -m "Initial portfolio commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/kishorevijay07/kishore-portfolio.git
git branch -M main
git push -u origin main
```

---

## ✏️ Personalisation Checklist

| File | What to change |
|------|---------------|
| `src/components/About.js` | Uncomment `<img>` tag, replace `YOUR_PHOTO_URL` |
| `src/components/Contact.js` | Replace `your@email.com`, LinkedIn & Twitter URLs |
| `src/components/Projects.js` | Add real GitHub links per project |
| `src/components/Navbar.js` | Update nav status text if needed |
| `public/index.html` | Update `<title>` and `<meta description>` |

---

## 🎨 Adding Your Photo

In `src/components/About.js`, find:
```jsx
{/* Replace the placeholder below with: */}
<span className="avatar-placeholder">KS</span>
```

Replace with:
```jsx
<img className="avatar-img" src="img/kishore.jpg" alt="Kishore Selvaraj" />
```

Or place a photo file in `/public/photo.jpg` and use `src="/photo.jpg"`.

---

Built with React 18 + plain CSS — no extra UI libraries needed.
