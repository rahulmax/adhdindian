# GitHub Issue Templates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add GitHub issue YAML templates for corrections, new doctors, and reviews, with in-app links on DoctorCard and footer that open pre-filled issue URLs.

**Architecture:** Three `.github/ISSUE_TEMPLATE/*.yml` files define structured forms. A helper function in `page.tsx` builds GitHub issue URLs with query params. DoctorCard expanded state gets two links; footer gets one link.

**Tech Stack:** GitHub Issue Forms (YAML), React/TypeScript

---

### Task 1: Create Correction Issue Template

**Files:**
- Create: `.github/ISSUE_TEMPLATE/correction.yml`

**Step 1: Create the template file**

```yaml
name: "Correction: Doctor Information"
description: Report incorrect information about a listed doctor
labels: ["correction"]
body:
  - type: input
    id: doctor-name
    attributes:
      label: Doctor Name
      description: Name of the doctor (pre-filled if you came from the app)
    validations:
      required: true
  - type: input
    id: doctor-id
    attributes:
      label: Doctor ID
      description: Internal ID (pre-filled from app, do not edit)
    validations:
      required: false
  - type: checkboxes
    id: what-is-incorrect
    attributes:
      label: What's incorrect?
      options:
        - label: Fee / pricing
        - label: Address / location
        - label: Contact / phone number
        - label: Consultation mode (online/offline)
        - label: Stimulants information
        - label: Specialist information
        - label: Doctor no longer practicing / clinic closed
        - label: Other
  - type: textarea
    id: correct-info
    attributes:
      label: Correct information
      description: Tell us what the correct information should be
      placeholder: "e.g. The consultation fee is actually ₹1500, not ₹1000"
    validations:
      required: true
  - type: textarea
    id: source
    attributes:
      label: How do you know?
      description: Optional — helps us verify faster
      placeholder: "e.g. I visited them last week / I called their clinic"
    validations:
      required: false
```

**Step 2: Commit**

```bash
git add .github/ISSUE_TEMPLATE/correction.yml
git commit -m "feat: add correction issue template"
```

---

### Task 2: Create New Doctor Issue Template

**Files:**
- Create: `.github/ISSUE_TEMPLATE/new-doctor.yml`

**Step 1: Create the template file**

```yaml
name: "New Doctor Submission"
description: Suggest a new ADHD doctor to be listed
labels: ["new-doctor"]
body:
  - type: input
    id: doctor-name
    attributes:
      label: Doctor Name
    validations:
      required: true
  - type: dropdown
    id: type
    attributes:
      label: Type
      options:
        - Psychiatrist
        - Psychologist
    validations:
      required: true
  - type: input
    id: city
    attributes:
      label: City
      placeholder: "e.g. Bangalore, Mumbai, Delhi"
    validations:
      required: true
  - type: input
    id: address
    attributes:
      label: Address / Clinic Name
      placeholder: "e.g. Apollo Clinic, Koramangala, Bangalore"
    validations:
      required: false
  - type: input
    id: fee
    attributes:
      label: Consultation Fee (₹)
      placeholder: "e.g. 1500"
    validations:
      required: false
  - type: dropdown
    id: consultation-mode
    attributes:
      label: Consultation Mode
      options:
        - Online
        - Offline
        - Both
        - Not sure
    validations:
      required: false
  - type: input
    id: contact
    attributes:
      label: Contact / Phone
      placeholder: "e.g. 9876543210"
    validations:
      required: false
  - type: dropdown
    id: stimulants
    attributes:
      label: Prescribes Stimulants?
      options:
        - "Yes"
        - "No"
        - In-person only
        - Not sure
    validations:
      required: false
  - type: dropdown
    id: adult-adhd
    attributes:
      label: Adult ADHD Specialist?
      options:
        - "Yes"
        - "No"
        - Not sure
    validations:
      required: false
  - type: textarea
    id: other-details
    attributes:
      label: Anything else?
      description: Online platform, ADHD testing, your experience, etc.
      placeholder: "e.g. They use Practo for online consultations. Very thorough with diagnosis."
    validations:
      required: false
```

**Step 2: Commit**

```bash
git add .github/ISSUE_TEMPLATE/new-doctor.yml
git commit -m "feat: add new doctor submission issue template"
```

---

### Task 3: Create Review Issue Template

**Files:**
- Create: `.github/ISSUE_TEMPLATE/review.yml`

**Step 1: Create the template file**

```yaml
name: "Doctor Review"
description: Share your experience with a listed doctor
labels: ["review"]
body:
  - type: input
    id: doctor-name
    attributes:
      label: Doctor Name
      description: Name of the doctor (pre-filled if you came from the app)
    validations:
      required: true
  - type: input
    id: doctor-id
    attributes:
      label: Doctor ID
      description: Internal ID (pre-filled from app, do not edit)
    validations:
      required: false
  - type: dropdown
    id: experience
    attributes:
      label: Overall Experience
      options:
        - Positive
        - Negative
        - Neutral
    validations:
      required: true
  - type: textarea
    id: review
    attributes:
      label: Your Review
      description: Share your experience — this helps others find the right doctor
      placeholder: "e.g. Very patient and thorough. Took time to explain the diagnosis and treatment options."
    validations:
      required: true
```

**Step 2: Commit**

```bash
git add .github/ISSUE_TEMPLATE/review.yml
git commit -m "feat: add doctor review issue template"
```

---

### Task 4: Add URL Builder and In-App Links

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add URL builder helper function**

Add after the existing helper functions (after `formatPhoneNumber`, around line 651):

```typescript
function githubIssueUrl(
  template: "correction" | "new-doctor" | "review",
  params?: { doctorName?: string; doctorId?: number; city?: string }
): string {
  const base = "https://github.com/rahulmax/adhdindia/issues/new";
  const query = new URLSearchParams();
  query.set("template", `${template}.yml`);

  if (params?.doctorName && params?.city) {
    if (template === "correction") {
      query.set("title", `Correction: ${params.doctorName} (${params.city})`);
    } else if (template === "review") {
      query.set("title", `Review: ${params.doctorName} (${params.city})`);
    }
  }
  if (params?.doctorName) query.set("doctor-name", params.doctorName);
  if (params?.doctorId) query.set("doctor-id", String(params.doctorId));

  return `${base}?${query.toString()}`;
}
```

**Step 2: Add links to DoctorCard expanded state**

In the `DoctorCard` component, inside the expanded `{expanded && (...)}` block, after the reviews section (the last `div` before the closing `</div>` of the expanded area), add:

```tsx
<div className="flex items-center gap-4 pt-2 border-t border-border">
  <a
    href={githubIssueUrl("correction", { doctorName: doctor.name, doctorId: doctor.id, city: doctor.city })}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-muted hover:text-accent transition-colors"
  >
    Incorrect info? Submit correction
  </a>
  <span className="text-border">|</span>
  <a
    href={githubIssueUrl("review", { doctorName: doctor.name, doctorId: doctor.id, city: doctor.city })}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-muted hover:text-accent transition-colors"
  >
    Add a review
  </a>
</div>
```

**Step 3: Add "Submit a doctor" link to footer**

In the `CommunityLinks` component, add a fourth link after the "Contribute" link:

```tsx
<span className="text-border">|</span>
<a
  href={githubIssueUrl("new-doctor")}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
>
  <ExternalLinkIcon />
  Submit a Doctor
</a>
```

**Step 4: Verify** — `npm run build` should pass. Manually check that links open correct GitHub issue forms with pre-filled fields.

**Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add in-app links for corrections, reviews, and new doctor submissions"
```
