# GitHub Issue Templates for Community Submissions

## Overview
Three GitHub issue YAML templates for corrections, new doctors, and reviews. In-app links on DoctorCard and footer open pre-filled GitHub issue URLs.

## Issue Templates

### 1. correction.yml (label: correction)
- Doctor Name (pre-filled, read-only)
- Doctor ID (pre-filled for unambiguous matching)
- What's incorrect (checkboxes: Fee, Address, Contact, Consultation Mode, Stimulants info, Specialist info, Other)
- Correct information (textarea, required)
- Source/how you know (textarea, optional)

### 2. new-doctor.yml (label: new-doctor)
- Doctor Name (required)
- Type (dropdown: Psychiatrist / Psychologist, required)
- City (required)
- Address (optional)
- Consultation Fee (optional)
- Consultation Mode (dropdown: Online / Offline / Both, optional)
- Contact/Phone (optional)
- Prescribes Stimulants (dropdown: Yes / No / In-person only / Unknown, optional)
- Adult ADHD Specialist (dropdown: Yes / No / Unknown, optional)
- Any other details (textarea, optional)

### 3. review.yml (label: review)
- Doctor Name (pre-filled, read-only)
- Doctor ID (pre-filled)
- Overall experience (dropdown: Positive / Negative / Neutral, required)
- Review (textarea, required)

## In-App Trigger Points
- DoctorCard expanded state: "Submit a correction" + "Add a review" links
- Footer: "Know a good doctor? Submit them" link

## URL Format
```
https://github.com/rahulmax/adhdindia/issues/new?template=correction.yml&title=Correction: Dr. Name (City)&doctor-name=Dr. Name&doctor-id=123
```
