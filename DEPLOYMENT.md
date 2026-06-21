# Deployment Guide

Deploy Trippin' to **Vercel** for production. This guide covers build configuration, environment variables, and post-deploy setup.

## Build & Framework Setup

### Vite Build

The app uses **Vite** for fast bundling:

```bash
npm run build
```

- **Command**: `npm run build` (runs TypeScript type-check + Vite build)
- **Output directory**: `dist/`
- **Framework**: Vite (detects automatically)

### SPA Rewrites

The app is a **single-page application** with client-side routing (React Router). Configure Vercel to rewrite all non-file requests to `index.html`:

**vercel.json** (add to project root if not present):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- `/` → serves `index.html`
- `/money`, `/trip`, `/gallery` → client-side routing (no 404 errors)
- `dist/` static assets are cached and served directly

## Environment Variables

### Set in Vercel Project

In **Vercel Dashboard** → Project Settings → Environment Variables, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_xxx` | Supabase anon/publishable key (RLS enforced) |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Maps API key | Browser-exposed (protected by referrer allow-list) |
| `VITE_GOOGLE_MAPS_MAP_ID` | (optional) | Custom map styling (defaults to demo ID if omitted) |

All `VITE_*` variables are injected at build time and exposed in the browser.

> **Security**: The Supabase anon key is intentionally public (Row-Level Security on the backend protects data). The Google Maps key is also public (public API; referrer restrictions limit misuse).

## Post-Deploy Configuration

After the first deploy, update Supabase and Google Cloud to trust the Vercel URL:

### 1. Supabase Auth URL Configuration

In **Supabase Dashboard** → Authentication → URL Configuration:

**Site URL** (single entry):
```
https://your-vercel-app.vercel.app
```

**Redirect URLs** (one per line):
```
https://your-vercel-app.vercel.app
http://localhost:5173
```

This tells Supabase where magic-link sign-in emails should redirect after the user clicks the link.

### 2. Google Maps API Restrictions

In **Google Cloud Console** → APIs & Services → Credentials:

Find your Maps API key → **Application Restrictions**:

- Restriction type: **HTTP referrer (web sites)**
- Allowed referrers (one per line):
  ```
  https://your-vercel-app.vercel.app/*
  http://localhost:5173/*
  ```

Allows the key to work from your Vercel domain + local dev.

## Supabase Edge Functions

The `weather` Edge Function fetches OpenWeather forecasts. Its API key is **server-side only**.

### Set the OpenWeather Secret

In **Supabase Dashboard** → Edge Functions → Secrets, add:

| Secret | Value |
|--------|-------|
| `OPENWEATHER_API_KEY` | Your OpenWeather API key |

This secret is **never exposed to the browser** — only the Edge Function can access it.

## PWA Installation

The app is a **Progressive Web App** (via vite-plugin-pwa). Users can:

1. Visit the app in Safari/Chrome/Edge on mobile
2. Tap **Share** → **Add to Home Screen** (iOS) or **Install app** (Android/desktop)
3. Run as a native-looking app, full-screen, no address bar

No additional deployment configuration needed — PWA metadata is baked into `dist/` at build time.

## Production Checklist

- [ ] Build locally: `npm run build` (should complete without errors)
- [ ] Vercel project created and connected to your git repo
- [ ] `vercel.json` present (SPA rewrite configured)
- [ ] Environment variables set in Vercel Dashboard (`VITE_SUPABASE_*`, `VITE_GOOGLE_MAPS_*`)
- [ ] Deploy triggered (git push or manual trigger in Vercel)
- [ ] Supabase Auth URL Configuration updated with Vercel domain
- [ ] Google Maps key allow-list includes Vercel domain
- [ ] `OPENWEATHER_API_KEY` secret set in Supabase Edge Functions
- [ ] Test magic-link sign-in from the deployed URL
- [ ] Test media upload (photos/videos)
- [ ] Test route map (should show interactive Google Map)
- [ ] Test PWA install on mobile

## Troubleshooting

### Build Fails

```bash
npm run build
```

Check for:
- TypeScript errors: `npm run lint`
- Missing dependencies: `npm install`
- Env var syntax in `.env.local` (should match `vite.config.ts` references)

### Magic-link sign-in broken

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set and correct
- Check Supabase Dashboard → Auth → Users to confirm member rows exist
- Verify Supabase Auth URL Configuration includes your Vercel domain
- Check Supabase logs for auth errors

### Google Map doesn't render

- Verify `VITE_GOOGLE_MAPS_API_KEY` is set in Vercel
- Confirm the key is enabled in Google Cloud Console (APIs & Services → Maps JavaScript API)
- Check Google Cloud referrer allow-list includes your Vercel domain
- Open browser DevTools → Console for API errors

### Media upload fails

- Verify Supabase storage buckets exist (`media-originals`, `media-thumbnails`)
- Confirm RLS policies allow the user to write to media tables
- Check browser DevTools → Network for upload errors
- Verify file size is within Supabase limits (default 50MB)

### Slow initial load / large bundle

The app code-splits each screen (lazy loading). Check:
- DevTools → Network: each screen chunk should load on demand
- Lighthouse performance: should be green (>90)
- No console warnings about unused imports

## Deployment Checklist (Per-Release)

Before pushing to production:

1. **Test locally**:
   ```bash
   npm run build && npm run preview
   ```
   
2. **Run tests**:
   ```bash
   npm run test
   ```
   
3. **Check for console errors**:
   ```bash
   npm run lint
   ```
   
4. **Verify env var requirements** are documented (see `.env.example`)

5. **Push to git** → Vercel auto-deploys

6. **Smoke test** on the deployed URL:
   - [ ] Home screen loads
   - [ ] Sign in works (magic-link)
   - [ ] Can navigate all four screens
   - [ ] Money calculations are correct
   - [ ] Map renders
   - [ ] Can upload media
   - [ ] Activity log appears

## Rollback

If deployment breaks:

1. **Vercel Dashboard** → Deployments → Previous deployment → Redeploy
   
   Or use the Vercel CLI:
   ```bash
   vercel --prod rollback
   ```

2. Check git history for recent commits:
   ```bash
   git log --oneline -5
   ```
   
3. Revert if needed:
   ```bash
   git revert <commit-hash>
   git push
   ```

Vercel will auto-redeploy on the next push.

---

**Need help?** Check logs:
- **Build logs**: Vercel Dashboard → Deployments → [Latest] → Logs
- **Supabase logs**: Supabase Dashboard → Logs
- **Google Cloud logs**: Google Cloud Console → Logging
