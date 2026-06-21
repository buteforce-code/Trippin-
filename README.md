# Trippin' – Trip Money, Route & Gallery

**Trippin'** by Buteforce is a shared trip money pool & content companion for organizing group travel. Each trip (e.g., "Kerala '26") brings together a group of travelers who split a shared expense pool. Members contribute money upfront, expenses are tracked by category, a live map shows the route with day-by-day itinerary and weather, a no-loss media gallery preserves originals, and a full activity log audits every transaction.

## What It Does

- **Shared Money Pool**: A fixed per-head fee (₹5,000 in Kerala '26) each member contributes. Track who has paid what, how much is spent, and who owes whom.
- **Expenses by Category**: Record expenses (food, transport, lodging, activities, etc.) and see spending split by category in a donut chart.
- **Contributions & Payments**: Record member payments as "splits" (one row per payment, even partial).
- **Money Dashboard**: View collected vs. spent, pending balance, per-head forecast, and category breakdown.
- **Route & Itinerary**: Interactive Google Map showing the trip route across stops. Each stop displays dates, weather (temperature + condition icon), and notes.
- **Media Gallery**: Upload photos and videos from any stop. Originals are stored untouched; thumbnails are generated separately for fast browsing. Resumable uploads, downloads, and no quality loss for originals.
- **Activity Log**: Audit trail of every expense, payment, media upload, and edit with actor name, action, amount/detail, and timestamp.

## Tech Stack

- **React 19** – UI framework
- **TypeScript 6** – Type safety
- **Vite 8** – Fast build and dev server
- **React Router 7** – Client-side routing
- **TanStack Query 5** – Server state management
- **Supabase** – Backend (PostgreSQL + Auth + Storage + Edge Functions)
- **Google Maps JS API** – Interactive route map
- **Vitest 4** – Unit testing
- **ESLint + TypeScript** – Code quality
- **PWA (Vite Plugin PWA)** – Installable web app

## Project Structure

```
src/
├── screens/              # Five main surfaces (Home, Money, Trip, Gallery, Login)
├── components/
│   ├── shell/           # MobileFrame, BottomNav, layout
│   ├── ui/              # Card, Avatar, Chips, LogRow (reusable)
│   ├── home/            # Header, HeroBalance, StatChips, SpendDonut, Contributions
│   ├── money/           # MemberRow, ExpenseRow
│   ├── trip/            # GoogleRouteMap, StylizedRouteMap, RouteMap
│   ├── gallery/         # MediaTile gallery grid
│   └── sheets/          # BottomSheets (AddExpense, RecordPayment, ActivityLog)
├── data/                # Repository pattern + fixtures
│   ├── repository.ts    # TripRepository interface
│   ├── mock.ts          # MockTripRepository (in-memory)
│   ├── supabaseRepo.ts  # SupabaseTripRepository (live)
│   ├── index.ts         # Active repo selector
│   ├── types.ts         # Data models
│   └── fixtures.ts      # Seed snapshot
├── lib/                 # Utilities
│   ├── supabase.ts      # Client init + isSupabaseConfigured flag
│   ├── database.types.ts # Generated from Supabase schema
│   ├── brand.ts         # APP_NAME, APP_VENDOR, APP_TAGLINE
│   ├── catalog.ts       # CATS (expense categories)
│   ├── time.ts          # formatRelativeTime, shortDateLabel
│   ├── media.ts         # readDimensions, generateThumbnail, classifyQuality
│   ├── resumableUpload.ts # Tus-based resumable upload
│   └── ...
├── hooks/               # Custom React hooks
├── providers/
│   ├── AuthProvider.tsx  # Magic-link auth + session mgmt
│   ├── ThemeProvider.tsx # Theme switching (lagoon/sunset/palm)
│   └── UIProvider.tsx    # UI state (sheets, modals)
├── styles/
│   ├── tokens.css       # Design tokens (colors, spacing, typography)
│   ├── keyframes.css    # Animations
│   └── global.css       # Base styles
├── App.tsx              # Route definitions + lazy loading
├── main.tsx             # Provider tree + QueryClient
└── test/
    └── setup.ts         # Vitest config
```

## The Repository Pattern

The app uses a **repository pattern** to abstract data access:

### `TripRepository` Interface

All screens depend on a single `TripRepository` interface:

```typescript
interface TripRepository {
  getSnapshot(): Promise<TripSnapshot>          // Full trip state
  addExpense(input: NewExpenseInput): Promise<void>
  recordPayment(memberIndex: number, amount?: number): Promise<void>
  uploadMedia(input: UploadMediaInput): Promise<void>
  getThumbUrl(item: MediaItem): Promise<string | null>
  getOriginalUrl(item: MediaItem): Promise<string | null>
}
```

### Implementation: MockTripRepository

**Phase 1 (Local UI work)**: In-memory store seeded with mock data. No backend required. State resets on reload (like the prototype). Activates when no Supabase env is set.

- Used for fast iteration and testing without internet access.
- Also **bypasses auth**; renders the app immediately in "mock mode."

### Implementation: SupabaseTripRepository

**Phase 2+ (Production)**: Lives data from Supabase. Writes go to PostgreSQL tables; reads aggregate from views. Activates when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present.

### Switching Repositories

The active repo is selected in `src/data/index.ts`:

```typescript
export const tripRepository: TripRepository =
  isSupabaseConfigured && supabase
    ? new SupabaseTripRepository(supabase)
    : new MockTripRepository()
```

No component changes needed — swap one line, everything works.

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in:

```env
# Supabase (only if you want live data; skip for local/mock mode)
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx

# Google Maps JS API (for the Trip > Route Map screen)
VITE_GOOGLE_MAPS_API_KEY=YOUR_MAPS_KEY
# Optional: custom map styling
VITE_GOOGLE_MAPS_MAP_ID=YOUR_MAP_ID
```

**Important**:
- The **Supabase anon key** is browser-safe; Supabase **Row-Level Security (RLS)** enforces access control on the backend.
- The **Google Maps key** is intentionally exposed in the browser (public JS API); it is protected by HTTP-referrer restriction in the Google Cloud Console (allow only your deployed domain + localhost for dev).

To run in **mock mode** (no backend, instant startup, perfect for UI work):
- Just skip setting `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- The app will use `MockTripRepository` and bypass auth

### 3. Start Development Server

```bash
npm run dev
```

Open `http://localhost:5173`. The dev server exposes itself on your LAN (`--host=true` in vite.config.ts), so you can test on a real phone on the same network.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Build for production (TypeScript check + Vite) |
| `npm run preview` | Preview the built app locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

## Backend Summary (Supabase "Kerala Trip 26")

When Supabase is configured, the app reads from and writes to these tables:

### Core Tables

| Table | Purpose |
|-------|---------|
| `trips` | One row per trip (name, per_head_amount, created_at) |
| `members` | Travelers (name, email, is_organizer, avatar_color, sort_order, user_id) |
| `contributions` | Payment records (member_id, amount, recorded_by, created_at) |
| `expenses` | Spending records (category, title, amount, paid_by, date_label, created_at) |
| `stops` | Day-by-day itinerary (name, date_label, note, lat, lng, state, weather_icon, temp, condition) |
| `media` | Photos/videos metadata (place, stop_key, quality_label, device, is_video, ratio, storage_path_original, storage_path_thumb, width, height, bytes) |
| `activity_log` | Audit trail (actor_name, kind: expense/payment/media/edit, detail, created_at) |

### Views

| View | Purpose |
|------|---------|
| `trip_money_summary` | Aggregated pool totals (total_pool, total_spent, total_pending) |
| `member_balances` | Per-member computed balances (paid, splits) |

### Authentication

- **Magic-link sign-in** via email (Supabase auth)
- On first sign-in, a trigger maps the user to a member row by email
- The organizer (Arjun) is seeded; their first magic-link auto-assigns them

### RLS (Row-Level Security)

- **Organizer** (Arjun): can write money (expenses, contributions); all members read-only
- **Members**: can read money tables; can read-write media (upload, download)
- **Helper functions** in a private schema enforce business logic (e.g., balance calculations)

### Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `media-originals` | Original files, untouched, resumable upload |
| `media-thumbnails` | 300px thumbnail JPEGs (fast browsing) |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `weather` | Fetches OpenWeather forecast for a stop (lat/lng) |

The API key (`OPENWEATHER_API_KEY`) is stored as a Supabase secret (server-side only, never in the browser).

## Auth Flow

1. User lands on the login screen (when Supabase is configured).
2. Enters their email → app calls `signInWithEmail()` (magic-link OTP).
3. Supabase sends a sign-in link to their inbox.
4. User clicks the link, which redirects back to the app with a session token.
5. A trigger in Supabase matches the user to a member row by email and sets `user_id`.
6. The app fetches the trip snapshot (auth context is now live).
7. Screens render.

In **mock mode**, this is skipped entirely; the app shows all screens immediately.

## Design & Branding

- **Responsive mobile-first**: Fixed-width frame (430px max) for consistent mobile UX
- **Theme system**: Three palettes (`lagoon`, `sunset`, `palm`) switchable at runtime
- **CSS custom properties** for all colors, spacing, typography
- **PWA-ready**: Can be installed to home screen (vite-plugin-pwa)

## Development Notes

- All computation (formatted money, filtered lists, animated counts) happens in screens/component `renderVals()` methods and helpers
- Templates use the repository pattern exclusively; no components fetch data directly
- Immutable updates via spread operator; state is never mutated in-place
- Errors are caught and logged; user-facing errors show in modal/sheet
- No hardcoded colors or labels — everything lives in `brand.ts`, `catalog.ts`, or `tokens.css`

## Testing

```bash
npm run test                # Run all tests once
npm run test:watch         # Watch mode
```

Tests use **Vitest** + **React Testing Library** + **Playwright** (for E2E).

Minimum coverage: **80%** of screens, components, and utilities.

## Building for Production

```bash
npm run build
```

Outputs to `dist/`. Ready to deploy to Vercel, Netlify, or any static host.

---

**Built by Buteforce** · Trip money, route & gallery — all in one place.
