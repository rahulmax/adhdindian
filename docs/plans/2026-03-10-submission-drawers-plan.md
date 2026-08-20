# Submission Drawers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace GitHub issue links with in-app bottom drawer forms that create GitHub issues via a server-side API route.

**Architecture:** A Next.js API route `/api/submit` receives form data and creates GitHub issues using the GitHub REST API. A `SubmissionDrawer` component in `page.tsx` renders three form variants (correction, review, new-doctor) as a bottom sheet. DoctorCard and footer trigger the drawer with pre-filled context. The `githubIssueUrl` helper is removed.

**Tech Stack:** Next.js API Routes, GitHub REST API (no library — native fetch), React state management

---

### Task 1: Create the API Route

**Files:**
- Create: `src/app/api/submit/route.ts`

**Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "rahulmax";
const REPO_NAME = "adhdindian";

type SubmissionType = "correction" | "review" | "new-doctor";

function formatCorrectionBody(fields: Record<string, unknown>): string {
  const incorrect = (fields.incorrect as string[]) || [];
  const lines = [
    `**Doctor:** ${fields.doctorName}`,
    fields.doctorId ? `**Doctor ID:** ${fields.doctorId}` : "",
    "",
    `**What's incorrect:**`,
    ...incorrect.map((item: string) => `- [x] ${item}`),
    "",
    `**Correct information:**`,
    String(fields.correctInfo || ""),
  ];
  if (fields.source) {
    lines.push("", `**How do you know:**`, String(fields.source));
  }
  return lines.filter((l) => l !== "").join("\n");
}

function formatReviewBody(fields: Record<string, unknown>): string {
  return [
    `**Doctor:** ${fields.doctorName}`,
    fields.doctorId ? `**Doctor ID:** ${fields.doctorId}` : "",
    "",
    `**Overall experience:** ${fields.experience}`,
    "",
    `**Review:**`,
    String(fields.review || ""),
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function formatNewDoctorBody(fields: Record<string, unknown>): string {
  const lines = [
    `**Doctor Name:** ${fields.doctorName}`,
    `**Type:** ${fields.type}`,
    `**City:** ${fields.city}`,
  ];
  if (fields.address) lines.push(`**Address:** ${fields.address}`);
  if (fields.fee) lines.push(`**Fee:** ₹${fields.fee}`);
  if (fields.consultationMode) lines.push(`**Consultation Mode:** ${fields.consultationMode}`);
  if (fields.contact) lines.push(`**Contact:** ${fields.contact}`);
  if (fields.stimulants) lines.push(`**Prescribes Stimulants:** ${fields.stimulants}`);
  if (fields.adultADHD) lines.push(`**Adult ADHD Specialist:** ${fields.adultADHD}`);
  if (fields.otherDetails) {
    lines.push("", `**Other details:**`, String(fields.otherDetails));
  }
  return lines.join("\n");
}

function getTitle(type: SubmissionType, fields: Record<string, unknown>): string {
  switch (type) {
    case "correction":
      return `Correction: ${fields.doctorName}${fields.city ? ` (${fields.city})` : ""}`;
    case "review":
      return `Review: ${fields.doctorName}${fields.city ? ` (${fields.city})` : ""}`;
    case "new-doctor":
      return `New Doctor: ${fields.doctorName}${fields.city ? ` (${fields.city})` : ""}`;
  }
}

function getLabel(type: SubmissionType): string {
  return type;
}

function formatBody(type: SubmissionType, fields: Record<string, unknown>): string {
  switch (type) {
    case "correction":
      return formatCorrectionBody(fields);
    case "review":
      return formatReviewBody(fields);
    case "new-doctor":
      return formatNewDoctorBody(fields);
  }
}

export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let body: { type: SubmissionType; fields: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, fields } = body;

  if (!type || !fields || !["correction", "review", "new-doctor"].includes(type)) {
    return NextResponse.json({ error: "Invalid submission type" }, { status: 400 });
  }

  // Basic validation
  if ((type === "correction" || type === "review") && !fields.doctorName) {
    return NextResponse.json({ error: "Doctor name is required" }, { status: 400 });
  }
  if (type === "correction" && !fields.correctInfo) {
    return NextResponse.json({ error: "Correct information is required" }, { status: 400 });
  }
  if (type === "review" && (!fields.experience || !fields.review)) {
    return NextResponse.json({ error: "Experience and review are required" }, { status: 400 });
  }
  if (type === "new-doctor" && (!fields.doctorName || !fields.type || !fields.city)) {
    return NextResponse.json({ error: "Name, type, and city are required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: getTitle(type, fields),
        body: formatBody(type, fields),
        labels: [getLabel(type)],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("GitHub API error:", res.status, err);
      return NextResponse.json({ error: "Failed to create submission" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("GitHub API request failed:", err);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 502 });
  }
}
```

**Step 2: Verify** — `npm run build` should pass (the route compiles).

**Step 3: Commit**

```bash
git add src/app/api/submit/route.ts
git commit -m "feat: add /api/submit route for GitHub issue creation"
```

---

### Task 2: Add SubmissionDrawer Component

**Files:**
- Modify: `src/app/page.tsx` — add the SubmissionDrawer component after CommunityLinks (~line 1340)

**Step 1: Add drawer types and state type**

Add after the existing type definitions (near `type PreferenceKey`):

```typescript
type DrawerType = "correction" | "review" | "new-doctor";
type DrawerContext = {
  type: DrawerType;
  doctorName?: string;
  doctorId?: number;
  city?: string;
};
```

**Step 2: Add the SubmissionDrawer component**

Add after the `CommunityLinks` component. This is a large component — here is the full code:

```tsx
const CORRECTION_OPTIONS = [
  "Fee / pricing",
  "Address / location",
  "Contact / phone number",
  "Consultation mode (online/offline)",
  "Stimulants information",
  "Specialist information",
  "Doctor no longer practicing / clinic closed",
  "Other",
];

function SubmissionDrawer({ context, onClose }: { context: DrawerContext; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Correction state
  const [incorrect, setIncorrect] = useState<string[]>([]);
  const [correctInfo, setCorrectInfo] = useState("");
  const [source, setSource] = useState("");

  // Review state
  const [experience, setExperience] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");

  // New doctor state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<string | null>(null);
  const [newCity, setNewCity] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newMode, setNewMode] = useState<string | null>(null);
  const [newContact, setNewContact] = useState("");
  const [newStimulants, setNewStimulants] = useState<string | null>(null);
  const [newAdultADHD, setNewAdultADHD] = useState<string | null>(null);
  const [newOther, setNewOther] = useState("");

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function toggleIncorrect(item: string) {
    setIncorrect((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  function canSubmit(): boolean {
    if (submitting) return false;
    switch (context.type) {
      case "correction":
        return correctInfo.trim().length > 0;
      case "review":
        return experience !== null && reviewText.trim().length > 0;
      case "new-doctor":
        return newName.trim().length > 0 && newType !== null && newCity.trim().length > 0;
    }
  }

  async function handleSubmit() {
    if (!canSubmit()) return;
    setSubmitting(true);
    setError(null);

    let fields: Record<string, unknown> = {};

    switch (context.type) {
      case "correction":
        fields = {
          doctorName: context.doctorName,
          doctorId: context.doctorId,
          city: context.city,
          incorrect,
          correctInfo,
          source: source || undefined,
        };
        break;
      case "review":
        fields = {
          doctorName: context.doctorName,
          doctorId: context.doctorId,
          city: context.city,
          experience,
          review: reviewText,
        };
        break;
      case "new-doctor":
        fields = {
          doctorName: newName,
          type: newType,
          city: newCity,
          address: newAddress || undefined,
          fee: newFee || undefined,
          consultationMode: newMode || undefined,
          contact: newContact || undefined,
          stimulants: newStimulants || undefined,
          adultADHD: newAdultADHD || undefined,
          otherDetails: newOther || undefined,
        };
        break;
    }

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: context.type, fields }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const title =
    context.type === "correction" ? "Submit Correction" :
    context.type === "review" ? "Add a Review" :
    "Submit a Doctor";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-lg bg-background rounded-t-2xl max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 text-muted hover:text-foreground transition-colors">
            <CrossIcon />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-positive/10 flex items-center justify-center text-positive">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-foreground font-semibold">Thanks for your submission!</p>
            <p className="text-muted text-sm">We&apos;ll review it shortly.</p>
          </div>
        ) : (
          <>
            {/* Scrollable form content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Doctor name header for correction/review */}
              {(context.type === "correction" || context.type === "review") && context.doctorName && (
                <div className="bg-surface rounded-xl px-4 py-3">
                  <p className="text-xs text-muted uppercase tracking-wider">Doctor</p>
                  <p className="text-foreground font-semibold">{context.doctorName}</p>
                  {context.city && <p className="text-sm text-muted">{context.city}</p>}
                </div>
              )}

              {/* --- Correction Form --- */}
              {context.type === "correction" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">What&apos;s incorrect?</p>
                    <div className="flex flex-wrap gap-2">
                      {CORRECTION_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => toggleIncorrect(opt)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            incorrect.includes(opt)
                              ? "bg-accent text-white"
                              : "bg-surface text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Correct information <span className="text-negative">*</span>
                    </label>
                    <textarea
                      value={correctInfo}
                      onChange={(e) => setCorrectInfo(e.target.value)}
                      placeholder="e.g. The consultation fee is actually ₹1500, not ₹1000"
                      rows={3}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      How do you know? <span className="text-muted text-xs">(optional)</span>
                    </label>
                    <textarea
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g. I visited them last week"
                      rows={2}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                </>
              )}

              {/* --- Review Form --- */}
              {context.type === "review" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Overall experience <span className="text-negative">*</span>
                    </p>
                    <div className="flex gap-2">
                      {["Positive", "Negative", "Neutral"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setExperience(opt)}
                          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                            experience === opt
                              ? opt === "Positive" ? "bg-positive text-white"
                              : opt === "Negative" ? "bg-negative text-white"
                              : "bg-warning text-white"
                              : "bg-surface text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Your review <span className="text-negative">*</span>
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience — this helps others find the right doctor"
                      rows={4}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                </>
              )}

              {/* --- New Doctor Form --- */}
              {context.type === "new-doctor" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Doctor Name <span className="text-negative">*</span>
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Dr. Sharma"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Type <span className="text-negative">*</span>
                    </p>
                    <div className="flex gap-2">
                      {["Psychiatrist", "Psychologist"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setNewType(opt)}
                          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                            newType === opt ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      City <span className="text-negative">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g. Bangalore, Mumbai, Delhi"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Address / Clinic Name</label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="e.g. Apollo Clinic, Koramangala"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Fee (₹)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newFee}
                        onChange={(e) => setNewFee(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1">Contact</label>
                      <input
                        type="tel"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Consultation Mode</p>
                    <div className="flex gap-2">
                      {["Online", "Offline", "Both"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setNewMode(newMode === opt ? null : opt)}
                          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                            newMode === opt ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Prescribes Stimulants?</p>
                    <div className="flex gap-2">
                      {["Yes", "No", "In-person only"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setNewStimulants(newStimulants === opt ? null : opt)}
                          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                            newStimulants === opt ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Adult ADHD Specialist?</p>
                    <div className="flex gap-2">
                      {["Yes", "No"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setNewAdultADHD(newAdultADHD === opt ? null : opt)}
                          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                            newAdultADHD === opt ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Anything else?</label>
                    <textarea
                      value={newOther}
                      onChange={(e) => setNewOther(e.target.value)}
                      placeholder="Online platform, ADHD testing, your experience, etc."
                      rows={3}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-negative text-center">{error}</p>
              )}
            </div>

            {/* Submit button */}
            <div className="shrink-0 px-5 pb-5 pt-3 border-t border-border">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white rounded-full font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Add the slideUp keyframe animation to globals.css**

Append to `src/app/globals.css`:

```css
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

**Step 3: Verify** — `npm run build` should pass.

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: add SubmissionDrawer component with correction, review, and new doctor forms"
```

---

### Task 3: Wire Up Drawer to DoctorCard and Footer

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add drawer state to Home component**

In the `Home` component (search for `export default function Home`), add state near the other useState calls:

```typescript
const [drawerContext, setDrawerContext] = useState<DrawerContext | null>(null);
```

**Step 2: Update DoctorCard to accept an onAction callback**

Change DoctorCard signature to:
```typescript
function DoctorCard({ doctor, onAction }: { doctor: Doctor; onAction: (type: DrawerType) => void })
```

Replace the existing correction/review links block (the `<div className="flex items-center gap-4 pt-2 border-t border-border">` at the bottom of the expanded area) with buttons:

```tsx
<div className="flex items-center gap-4 pt-2 border-t border-border">
  <button
    onClick={() => onAction("correction")}
    className="text-xs text-muted hover:text-accent transition-colors"
  >
    Incorrect info? Submit correction
  </button>
  <span className="text-border">|</span>
  <button
    onClick={() => onAction("review")}
    className="text-xs text-muted hover:text-accent transition-colors"
  >
    Add a review
  </button>
</div>
```

**Step 3: Update DoctorCard usage in the results render**

Where DoctorCard is rendered in the results list, change:
```tsx
<DoctorCard key={doctor.id} doctor={doctor} />
```
to:
```tsx
<DoctorCard
  key={doctor.id}
  doctor={doctor}
  onAction={(type) => setDrawerContext({
    type,
    doctorName: doctor.name,
    doctorId: doctor.id,
    city: doctor.city,
  })}
/>
```

**Step 4: Update footer "Submit a Doctor" link**

In the `CommunityLinks` component, it currently uses `githubIssueUrl("new-doctor")`. Change it to accept an `onSubmitDoctor` prop:

```typescript
function CommunityLinks({ onSubmitDoctor }: { onSubmitDoctor: () => void })
```

Replace the "Submit a Doctor" `<a>` tag with a button:
```tsx
<button
  onClick={onSubmitDoctor}
  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
>
  <ExternalLinkIcon />
  Submit a Doctor
</button>
```

Update the CommunityLinks usage in the footer to:
```tsx
<CommunityLinks onSubmitDoctor={() => setDrawerContext({ type: "new-doctor" })} />
```

**Step 5: Render the drawer**

At the very end of the results return block (just before the closing `</div>` of the outermost div), add:

```tsx
{drawerContext && (
  <SubmissionDrawer
    context={drawerContext}
    onClose={() => setDrawerContext(null)}
  />
)}
```

**Step 6: Remove the githubIssueUrl helper function**

Delete the entire `githubIssueUrl` function — it's no longer used.

**Step 7: Verify** — `npm run build` should pass.

**Step 8: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up submission drawers to doctor cards and footer"
```

---

### Task 4: Add .env.local Template and Update .gitignore

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (if it exists, otherwise create)

**Step 1: Create .env.example**

```
# GitHub Personal Access Token (needs repo scope for issue creation)
GITHUB_TOKEN=ghp_your_token_here
```

**Step 2: Ensure .gitignore has .env entries**

Check if `.gitignore` exists. If it does, ensure it contains:
```
.env
.env.local
```
If not, add those lines.

**Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "feat: add .env.example for GitHub token configuration"
```
