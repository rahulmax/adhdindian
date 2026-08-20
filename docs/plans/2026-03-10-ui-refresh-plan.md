# UI Refresh: Blue/Lavender Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the visual design from teal/green to a blue/lavender palette with dark hero headers and arc patterns inspired by the reference design.

**Architecture:** CSS variable swap for colors, new utility class for arc pattern background, component-level Tailwind class updates in page.tsx. No structural or logic changes.

**Tech Stack:** Tailwind CSS v4, CSS custom properties, inline SVG

---

### Task 1: Update Color Palette

**Files:**
- Modify: `src/app/globals.css` (lines 20-46)
- Modify: `src/app/layout.tsx` (lines 20-23, theme colors)

**Step 1: Update CSS variables in globals.css**

Replace `:root` block:
```css
:root {
  --background: #ffffff;
  --foreground: #0a0b0d;
  --surface: #F0F2F8;
  --surface-hover: #E4E7F0;
  --border-color: #D8DCE8;
  --muted: #6b7280;
  --accent: #4A6CF7;
  --accent-hover: #3B5CE5;
  --positive: #16a34a;
  --negative: #dc2626;
  --warning: #f59e0b;
}
```

Replace `.dark` block:
```css
.dark {
  --background: #0D0F18;
  --foreground: #f0f0f0;
  --surface: #161825;
  --surface-hover: #1E2135;
  --border-color: #282B3D;
  --muted: #8b8d97;
  --accent: #6B8AFF;
  --accent-hover: #4A6CF7;
  --positive: #22c55e;
  --negative: #ef4444;
  --warning: #fbbf24;
}
```

**Step 2: Update layout.tsx theme colors**

Change theme-color meta values to match new background colors:
- Light: `#ffffff`  (unchanged)
- Dark: `#0D0F18`

**Step 3: Verify** — run `npm run dev`, check light/dark mode colors render correctly.

**Step 4: Commit** — `feat: update color palette to blue/lavender`

---

### Task 2: Add Arc Pattern Background Utility

**Files:**
- Modify: `src/app/globals.css` (append new classes)

**Step 1: Add arc pattern CSS classes**

Append to globals.css:
```css
.hero-dark {
  background-color: #1A1D2E;
  position: relative;
  overflow: hidden;
}
.dark .hero-dark {
  background-color: #0D0F18;
}
.hero-dark::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Ccircle cx='400' cy='0' r='60' opacity='0.08'/%3E%3Ccircle cx='400' cy='0' r='120' opacity='0.06'/%3E%3Ccircle cx='400' cy='0' r='180' opacity='0.05'/%3E%3Ccircle cx='400' cy='0' r='240' opacity='0.04'/%3E%3Ccircle cx='400' cy='0' r='300' opacity='0.03'/%3E%3Ccircle cx='400' cy='0' r='360' opacity='0.02'/%3E%3C/g%3E%3C/svg%3E");
  background-position: top right;
  background-repeat: no-repeat;
  pointer-events: none;
}
```

**Step 2: Verify** — add `hero-dark` class to a test div, check pattern renders.

**Step 3: Commit** — `feat: add dark hero background with arc pattern`

---

### Task 3: Restyle Wizard Welcome Screen

**Files:**
- Modify: `src/app/page.tsx` — `WelcomeStep` component (~lines 824-887)

**Step 1: Update WelcomeStep**

- Wrap the top portion (logo + title + description) in a `hero-dark` div with white text
- Make title larger: `text-4xl` with white color
- Description text: `text-white/70`
- Info items below remain on white/dark background
- "Get Started" button: change to dark charcoal style `bg-[#1A1D2E] hover:bg-[#252840] dark:bg-white dark:text-[#0D0F18] dark:hover:bg-white/90`
- Icon backgrounds in info items: use accent color classes (already work with new blue)

**Step 2: Verify** — check welcome screen in light and dark mode.

**Step 3: Commit** — `feat: restyle wizard welcome with dark hero header`

---

### Task 4: Restyle Wizard Location & Preferences Screens

**Files:**
- Modify: `src/app/page.tsx` — `LocationStep` (~lines 891-1044), `PreferencesStep` (~lines 1048-1129)

**Step 1: Update LocationStep**

- Add `hero-dark` section for the title area ("Where are you located?") — white text on dark bg
- "Use my location" button: dark charcoal style matching Welcome CTA
- City grid cards: unchanged (they inherit new surface/border colors automatically)

**Step 2: Update PreferencesStep**

- Add `hero-dark` section for the title area ("What are you looking for?")
- Selected preference cards: change `border-accent bg-accent/5` to include a left border accent: `border-l-4 border-l-accent border-accent/30 bg-accent/5`
- "See Results" button: dark charcoal style

**Step 3: Verify** — check both wizard screens in light and dark mode.

**Step 4: Commit** — `feat: restyle wizard location and preferences screens`

---

### Task 5: Restyle Results Header

**Files:**
- Modify: `src/app/page.tsx` — results header section (~lines 1549-1655)

**Step 1: Update sticky header**

- Replace `bg-background/80 backdrop-blur-xl border-b border-border` with `hero-dark` class
- Title "ADHD Indian": change to `text-white`
- SpinningLogo: add `text-white` (it uses `text-accent` currently — keep as-is since blue accent works on dark, OR switch to white)
- City pill: restyle for dark bg — `border-white/20 bg-white/10 text-white` with accent highlights
- Theme toggle: `bg-white/10 hover:bg-white/15 text-white`
- Search input: `bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white/30`
- Filter chips: inactive `bg-white/10 text-white/70 hover:bg-white/15`, active stays `bg-accent text-white`
- "All Filters" button: inactive `bg-white/10 text-white/70`, active stays `bg-accent text-white`
- Sort dropdown: `bg-white/10 border-white/10 text-white`
- Remove `border-b border-border` from header (dark hero has no bottom border)

**Step 2: Verify** — scroll results, check sticky header in both themes.

**Step 3: Commit** — `feat: restyle results header with dark hero treatment`

---

### Task 6: Restyle Doctor Cards

**Files:**
- Modify: `src/app/page.tsx` — `DoctorCard` component (~lines 1133-1251)

**Step 1: Update card styling**

- Outer container: `p-5` (was `p-4`), add `shadow-sm hover:shadow-md`, reduce border: `border border-border/50`
- Doctor name: `text-lg font-bold` (was `text-base font-semibold`)
- Fee: already `text-lg font-semibold`, keep as-is

**Step 2: Update stimulants badge**

- In `Badge` component, rename `purple` variant to `orange`:
  ```
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
  ```
- Update all `variant="purple"` references to `variant="orange"`

**Step 3: Verify** — check doctor cards, expanded state, badges in both themes.

**Step 4: Commit** — `feat: restyle doctor cards with more spacing, shadows, and orange stimulants badge`

---

### Task 7: Restyle Loading Screen

**Files:**
- Modify: `src/app/page.tsx` — loading screen (~lines 1511-1518)

**Step 1: Update loading screen**

- Add arc pattern: change `bg-background` to include `hero-dark` styling so the loading screen matches the new dark aesthetic
- SpinningLogo: `text-white`
- Loading text: `text-white/60`

**Step 2: Verify** — refresh page, check loading screen.

**Step 3: Commit** — `feat: restyle loading screen with dark hero`

---

### Task 8: Visual QA Pass

**Step 1:** Walk through the full flow: loading → welcome → location → preferences → results
**Step 2:** Toggle dark mode at each step
**Step 3:** Check mobile viewport (375px width)
**Step 4:** Fix any visual inconsistencies found
**Step 5: Commit** — `fix: visual QA polish`
