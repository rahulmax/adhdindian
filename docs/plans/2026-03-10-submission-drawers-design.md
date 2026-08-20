# In-App Submission Drawers Design

## Overview
Replace GitHub issue links with in-app bottom drawers that submit to a Next.js API route, which creates GitHub issues in the background.

## API Route: /api/submit/route.ts
- Single POST endpoint: `{ type, fields }`
- Creates GitHub issue via GitHub API with GITHUB_TOKEN env var
- Sets label per type (correction, review, new-doctor)
- Formats issue body as structured markdown

## SubmissionDrawer Component
- Single component, renders different fields based on type
- Slides up from bottom, overlay, max-height ~85vh, scrollable
- Close via X, overlay tap
- Submit button with spinner → success checkmark → auto-close

## Form Variants

### Correction (from doctor card)
- Doctor name (read-only header, pre-filled)
- What's incorrect (checkboxes)
- Correct information (textarea, required)
- How do you know (textarea, optional)

### Review (from doctor card)
- Doctor name (read-only header, pre-filled)
- Overall experience (3 tappable pills: Positive/Negative/Neutral)
- Your review (textarea, required)

### New Doctor (from footer)
- Name (required), Type (pills, required), City (required)
- Address, Fee, Consultation mode (pills), Contact (all optional)
- Stimulants (pills), Adult ADHD specialist (pills) (optional)
- Anything else (textarea, optional)

## Trigger Points
- DoctorCard expanded: "Incorrect info?" + "Add a review" links
- Footer: "Submit a Doctor" link

## Files
- Create: src/app/api/submit/route.ts
- Modify: src/app/page.tsx
