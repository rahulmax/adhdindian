#!/usr/bin/env node

/**
 * Clean up address fields in doctors.json and add mapsLink field.
 *
 * Run AFTER other cleanup scripts:
 *   node scripts/clean-addresses.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "..", "src", "data", "doctors.json");

const doctors = JSON.parse(readFileSync(filePath, "utf-8"));

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Addresses that are unhelpful / effectively null */
const UNHELPFUL_PATTERNS = [
  /^i'?m not sure\.?$/i,
  /^not sure\.?$/i,
  /^not aware of it/i,
  /^online$/i,
  /^online practice$/i,
  /^does online sessions only$/i,
  /^they only take online sessions$/i,
  /^n\/a$/i,
  /^practices online/i,
  /^www\.\S+\.\S+.*no physical address/i,
];

/** Check whether a string is ALL CAPS (ignoring numbers, punctuation, whitespace) */
function isAllCaps(str) {
  const letters = str.replace(/[^a-zA-Z]/g, "");
  return letters.length > 3 && letters === letters.toUpperCase();
}

/** Convert a string to Title Case, respecting common small words */
const SMALL_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at",
  "to", "by", "in", "of", "up", "as", "is", "it", "no",
]);

function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|[-/(])\S/g, (match) => match.toUpperCase());
}

/** Fix spacing around commas and punctuation */
function fixSpacing(str) {
  // Multiple spaces before comma/period
  str = str.replace(/\s+,/g, ",");
  // Ensure single space after comma (unless end of string)
  str = str.replace(/,(?!\s|$)/g, ", ");
  // Collapse multiple spaces
  str = str.replace(/ {2,}/g, " ");
  return str.trim();
}

/** Fix double (or more) closing parentheses */
function fixParens(str) {
  // "Both Bangalore))" → "Both Bangalore)"
  str = str.replace(/\)+/g, (match) => ")");
  return str;
}

/** Check if address is a Google Maps URL */
function isGoogleMapsUrl(str) {
  return /^https?:\/\/(goo\.gl\/maps|www\.google\.com\/maps|maps\.google|maps\.app\.goo\.gl)/i.test(str.trim());
}

/** Check if address is a "Google 'Foo Bar'" pattern */
function isGoogleSearchPattern(str) {
  return /^google\s+['"]/i.test(str.trim());
}

/** Extract name from "Google 'Beautiful Mind Healthcare'" */
function extractFromGooglePattern(str) {
  const match = str.match(/^google\s+['"](.+?)['"]$/i);
  return match ? match[1] : null;
}

/** Determine whether an address looks like a proper street address (vs just a name) */
function isProperAddress(addr) {
  if (!addr) return false;
  // Has a pincode / postal code
  if (/\b\d{6}\b/.test(addr)) return true;
  // Has road/street/floor/plot/sector indicators
  if (/\b(road|rd|street|st|floor|plot|sector|sec|lane|block|nagar|layout|colony|marg|vihar|puram|enclave|chowk)\b/i.test(addr)) return true;
  // Has a building number pattern
  if (/\b\d+[/-]?\d*[a-zA-Z]?\s*,/.test(addr)) return true;
  return false;
}

/** Check if address is just a contact detail (phone or email) mistakenly in address field */
function isContactInfo(str) {
  const trimmed = str.trim();
  // Pure phone number
  if (/^\d{10,}$/.test(trimmed)) return true;
  // Email address
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(trimmed)) return true;
  return false;
}

/** Generate a Google Maps search URL */
function makeMapsLink(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// ── Main processing ──────────────────────────────────────────────────────────

const changes = [];

for (const doc of doctors) {
  let addr = doc.address;
  let mapsLink = null;
  const origAddr = addr;

  if (addr == null || addr.trim() === "") {
    // Already null/empty
    doc.mapsLink = null;
    continue;
  }

  const trimmed = addr.trim();

  // 1. Check unhelpful addresses → set to null
  if (UNHELPFUL_PATTERNS.some((pat) => pat.test(trimmed))) {
    addr = null;
    changes.push({ id: doc.id, name: doc.name, field: "address", from: origAddr, to: null, reason: "unhelpful address" });
  }

  // 2. Contact info in address field → set to null
  else if (isContactInfo(trimmed)) {
    addr = null;
    changes.push({ id: doc.id, name: doc.name, field: "address", from: origAddr, to: null, reason: "contact info, not address" });
  }

  // 3. Google Maps URL → move to mapsLink
  else if (isGoogleMapsUrl(trimmed)) {
    mapsLink = trimmed;
    addr = null;
    changes.push({ id: doc.id, name: doc.name, field: "address", from: origAddr, to: null, reason: "maps URL moved to mapsLink" });
  }

  // 4. "Google 'Foo'" pattern → extract name
  else if (isGoogleSearchPattern(trimmed)) {
    const extracted = extractFromGooglePattern(trimmed);
    if (extracted) {
      addr = extracted;
      changes.push({ id: doc.id, name: doc.name, field: "address", from: origAddr, to: addr, reason: "extracted from Google search pattern" });
    }
  }

  // 5. Apply text cleanups for non-null addresses
  if (addr != null) {
    let cleaned = addr;

    // Fix double parentheses
    const beforeParens = cleaned;
    cleaned = fixParens(cleaned);
    if (cleaned !== beforeParens) {
      changes.push({ id: doc.id, name: doc.name, field: "address", from: beforeParens, to: cleaned, reason: "fixed double parens" });
    }

    // ALL CAPS → Title Case
    if (isAllCaps(cleaned)) {
      const beforeCaps = cleaned;
      cleaned = toTitleCase(cleaned);
      changes.push({ id: doc.id, name: doc.name, field: "address", from: beforeCaps, to: cleaned, reason: "ALL CAPS → Title Case" });
    }

    // Fix spacing around commas/punctuation
    const beforeSpacing = cleaned;
    cleaned = fixSpacing(cleaned);
    if (cleaned !== beforeSpacing) {
      changes.push({ id: doc.id, name: doc.name, field: "address", from: beforeSpacing, to: cleaned, reason: "fixed spacing" });
    }

    // Trim
    cleaned = cleaned.trim();

    addr = cleaned;
  }

  // 6. Generate mapsLink
  if (mapsLink == null && addr != null && addr.trim() !== "") {
    const city = doc.city || "";
    // Build a search query — use address + city
    const query = addr.includes(city) ? addr : `${addr}, ${city}`;
    mapsLink = makeMapsLink(query);
  }

  // 7. Write back — preserve field order by rebuilding the object
  if (addr !== origAddr) {
    doc.address = addr;
  }
  doc.mapsLink = mapsLink;
}

// Rebuild each doctor object so mapsLink comes right after address
const reordered = doctors.map((doc) => {
  const result = {};
  for (const key of Object.keys(doc)) {
    result[key] = doc[key];
    if (key === "address") {
      result.mapsLink = doc.mapsLink;
    }
  }
  // Remove any duplicate mapsLink that appeared later
  // (already handled by insertion order — JS objects preserve insertion order)
  return result;
});

// ── Write output ─────────────────────────────────────────────────────────────

writeFileSync(filePath, JSON.stringify(reordered, null, 2) + "\n", "utf-8");

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n=== Address Cleanup Summary ===\n`);
console.log(`Total doctors processed: ${doctors.length}`);
console.log(`Total changes made: ${changes.length}\n`);

if (changes.length > 0) {
  for (const c of changes) {
    console.log(`[#${c.id}] ${c.name}`);
    console.log(`  Reason: ${c.reason}`);
    console.log(`  Before: ${c.from}`);
    console.log(`  After:  ${c.to}`);
    console.log();
  }
}

const withMapsLink = reordered.filter((d) => d.mapsLink != null).length;
const withoutMapsLink = reordered.filter((d) => d.mapsLink == null).length;
console.log(`Doctors with mapsLink: ${withMapsLink}`);
console.log(`Doctors without mapsLink (null/online): ${withoutMapsLink}`);
console.log(`\nDone. Updated ${filePath}`);
