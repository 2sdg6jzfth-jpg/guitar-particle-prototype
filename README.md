# Guitar Particle — Prototype

A clickable Next.js prototype of Guitar Particle: a Shazam-style guitar app that listens, identifies songs, and shows you the chords. Mobile-first iOS-style frame, "cross-lit" warm/cool aesthetic, mock data only.

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The first time you load the prototype you'll be sent through the 5-step onboarding flow. To replay it, scroll to the bottom of **Settings** and tap **Reset onboarding**.

## What's wired up

- **Home / Listening** — tap the plectrum to start a 12-second "listen" countdown; it cross-fades into a music note and surfaces a Wonderwall result. Tap to cancel mid-listen, tap again to restart.
- **Chord page** — section pills, key/position/hand controls, Diagrams / Lyrics / Tabs (Tabs is Pro-locked), Real vs Simple strum, BPM transport, Play (auto-cycles through chords), Save sheet → Library.
- **Library** — saved songs persist in `localStorage`; sort by recent / A–Z / key / tempo; filter by category; new categories can be created from the Save sheet.
- **Search** — recent searches + trending + live filtering against a mock catalog.
- **For You** — streak card, curated playlist carousel, recommended-because-you-like-Oasis list.
- **Tuner** — visual mock (E2, 82.41 Hz). Tapping a string switches the displayed note. Real pitch detection is intentionally out of scope.
- **Settings** + **Manage Subscription** — toggle Pro from the paywall, then come back to manage / cancel.
- **Custom Strum Builder** — Pro-gated: paywall opens immediately if you're not Pro. Beat cells cycle empty → down → up.
- **Pro Paywall** — full-screen modal with monthly / yearly plans (yearly default + Save 33% badge). "Start trial" sets `localStorage.guitar_particle_pro` and unlocks gated features.
- **Onboarding** — Welcome → Account → About → Mic permission → Done. User prefs save to `localStorage`.

## Project structure

```
app/
  page.tsx                       # Home / Listening
  layout.tsx                     # Phone frame + onboarding gate
  globals.css                    # Tailwind layers + soundBar keyframe
  chord/[songId]/page.tsx        # Chord result (the heaviest screen)
  search/, chords/, for-you/, library/, tuner/  # main tabs + tuner
  settings/, settings/subscription/
  strum-builder/
  onboarding/{welcome,account,about,permission,done}/
components/
  phone-frame, cross-lit-halos   # frame + ambient lighting
  plectrum, music-note,
  plectrum-to-note-morph,
  pulsing-rings                  # the brand element + listening anim
  bottom-nav, status-bar,
  home-indicator, page-title-bar
  segmented-control, dropdown    # form controls
  chord-card, chord-diagram      # the 6×4 fretboard
  save-sheet, pro-paywall, toast # modals/transient UI
  cover                          # gradient album-art placeholder
  onboarding-gate                # client-side first-launch redirect
lib/
  mock-data.ts                   # Wonderwall + trending + recommended
  storage.ts                     # SSR-safe localStorage wrapper
```

## Design tokens (Tailwind)

The dark palette is wired up in `tailwind.config.ts`. Key colors:

- `bg-bg-primary` `#0A0E18` — base
- `bg-bg-surface` `#14181F` — modal/sheet
- `text-text` `#F5EBD7` — cream (used as `text-text` and `bg-text/[0.04]` for tints)
- `text-amber` `#FFD89A` — warm accent (active state, primary CTA)
- `text-cyan` `#A8E9F4` — cool accent (up-strums, tuner flat indicator)

The active-state pattern across the app is **solid amber background + dark text on active**, **transparent + cream text on inactive** — used in nav, segmented controls, sort pills, section pills.

## What's not in this prototype

- No real audio I/O. The Listen flow is a 12-second timer; the tuner is static.
- Only one song (Wonderwall) is fully populated. Other songs in search/trending/recommended route to the same chord page.
- No real auth, payments, or backend. Everything that "saves" lives in `localStorage`.

## Resetting state

Open DevTools → Application → Local Storage → clear keys starting with `guitar_particle_*`. Or just use the "Reset onboarding" button in Settings.

## Tech

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS 3
- Framer Motion 11
- lucide-react

— Built as a clickable demo. Not production code.
