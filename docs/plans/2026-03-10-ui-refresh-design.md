# UI Refresh: Blue/Lavender Design

## Color Palette

### Light Mode
- `--accent`: `#4A6CF7` (vibrant blue)
- `--accent-hover`: `#3B5CE5`
- `--surface`: `#F0F2F8` (cool lavender-gray)
- `--surface-hover`: `#E4E7F0`
- `--border-color`: `#D8DCE8`
- `--background`: `#ffffff`

### Dark Mode
- `--accent`: `#6B8AFF`
- `--accent-hover`: `#4A6CF7`
- `--surface`: `#161825` (deep blue-black)
- `--surface-hover`: `#1E2135`
- `--border-color`: `#282B3D`
- `--background`: `#0D0F18` (deep navy-black)

### Badge: Stimulants
- Orange variant replacing purple: `bg-orange-100 text-orange-700` / `bg-orange-900/30 text-orange-300`

## Dark Hero Header with Arc Pattern
- Wizard screens: top ~40% dark hero with concentric arc SVG pattern
- Results: dark sticky header with arc pattern at low opacity
- Search bar becomes semi-transparent on dark surface
- Arc pattern: CSS SVG background, concentric quarter-circle arcs, top-right corner

## Card & Component Redesign
- Doctor cards: more padding (p-5), larger name (text-lg), shadow-sm hover:shadow-md
- Wizard preference cards: blue left border accent on selected state
- Primary CTA buttons: dark charcoal (`bg-[#1A1D2E]`) with white text
- Typography: wizard headings to text-3xl/text-4xl

## Files Touched
- `globals.css` — palette + arc pattern class
- `page.tsx` — component styling
- `layout.tsx` — theme colors
