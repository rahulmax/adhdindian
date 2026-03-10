#!/usr/bin/env node

/**
 * Cleans up phone/contact fields in doctors.json.
 * Run AFTER clean-names.mjs has finished.
 *
 * Usage: node scripts/clean-phones.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "src", "data", "doctors.json");

// City STD codes (without leading 0)
const STD_CODES = {
  mumbai: "22",
  delhi: "11",
  "new delhi": "11",
  kolkata: "33",
  chennai: "44",
  bangalore: "80",
  bengaluru: "80",
  hyderabad: "40",
  ahmedabad: "79",
  pune: "20",
  surat: "261",
  jaipur: "141",
  lucknow: "522",
  kanpur: "512",
  nagpur: "712",
  indore: "731",
  thane: "22",
  bhopal: "755",
  visakhapatnam: "891",
  vadodara: "265",
  ghaziabad: "120",
  ludhiana: "161",
  agra: "562",
  nashik: "253",
  ranchi: "651",
  chandigarh: "172",
  coimbatore: "422",
  patna: "612",
  kochi: "484",
  kozhikode: "495",
  bhubaneswar: "674",
  dehradun: "135",
  guwahati: "361",
  noida: "120",
  gurgaon: "124",
  gurugram: "124",
  mysore: "821",
  mysuru: "821",
  mangalore: "824",
  mangaluru: "824",
  thiruvananthapuram: "471",
  trivandrum: "471",
  thrissur: "487",
  calicut: "495",
};

// Junk / unknown values that should become null
const JUNK_PATTERNS = [
  /^idk$/i,
  /^i\s*don'?t\s*know$/i,
  /^not\s*sure$/i,
  /^n\/?a$/i,
  /^nil$/i,
  /^none$/i,
  /^--?$/i,
  /^0+$/,
  /^hospital\.?$/i,
  /^reception$/i,
  /^opd\.?$/i,
  /^apollo$/i,
  /^visit\w*$/i,
  /^ama\w*site$/i,
  /^1234567890$/,
];

function isJunk(value) {
  if (!value || value.trim() === "") return true;
  const trimmed = value.trim();
  return JUNK_PATTERNS.some((p) => p.test(trimmed));
}

function stripAnnotations(num) {
  // Remove parenthetical annotations like "(discontinued)"
  return num.replace(/\([^)]*\)/g, "");
}

function cleanSingleNumber(num, city) {
  num = num.trim();
  if (!num) return null;

  // Strip +91 prefix (only if explicitly prefixed with + or has 12+ digits)
  if (num.startsWith("+91")) {
    num = num.replace(/^\+91[\s-]*/, "");
  } else {
    // Only strip leading "91" if the result would still be 10 digits (i.e., 12-digit number)
    const rawDigits = num.replace(/\D/g, "");
    if (rawDigits.length >= 12 && rawDigits.startsWith("91")) {
      num = rawDigits.slice(2);
    }
  }

  // If still has non-digit chars (besides hyphen), remove them
  // but first check if it looks like a formatted landline
  const digits = num.replace(/\D/g, "");

  if (!digits) return null;

  // 10-digit mobile number
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return digits;
  }

  // 10-digit number starting with a known STD code (landline)
  if (digits.length === 10 && city) {
    const cityLower = city.toLowerCase();
    const stdCode = STD_CODES[cityLower];
    if (stdCode && digits.startsWith(stdCode)) {
      const localPart = digits.slice(stdCode.length);
      return `0${stdCode}-${localPart}`;
    }
  }

  // 11-digit starting with 0 (already has STD prefix)
  if (digits.length === 11 && digits.startsWith("0")) {
    // Format as 0XXX-XXXXXXX
    if (city) {
      const cityLower = city.toLowerCase();
      const stdCode = STD_CODES[cityLower];
      if (stdCode && digits.startsWith("0" + stdCode)) {
        const localPart = digits.slice(1 + stdCode.length);
        return `0${stdCode}-${localPart}`;
      }
    }
    return digits;
  }

  // Short number (landline without STD code, < 10 digits)
  if (digits.length < 10) {
    if (city) {
      const cityLower = city.toLowerCase();
      const stdCode = STD_CODES[cityLower];
      if (stdCode) {
        return `0${stdCode}-${digits}`;
      }
    }
    // Unknown city, leave as-is
    return digits;
  }

  // 10 digits but doesn't start with 6-9 and no STD match — return as-is
  if (digits.length === 10) {
    return digits;
  }

  // Longer than 11 digits — might have extra prefix, try stripping 91
  if (digits.length === 12 && digits.startsWith("91")) {
    const inner = digits.slice(2);
    if (inner.length === 10 && /^[6-9]/.test(inner)) {
      return inner;
    }
  }

  // Fallback: return digits as-is
  return digits;
}

function cleanContact(contact, city) {
  if (contact === null || contact === undefined) return { cleaned: null, changed: false };

  const original = contact;

  if (isJunk(contact)) {
    return { cleaned: null, changed: original !== null };
  }

  // Strip annotations
  let stripped = stripAnnotations(contact);

  // Split on comma or slash
  const parts = stripped.split(/[,\/]/).map((s) => s.trim()).filter(Boolean);

  const cleanedParts = [];
  for (const part of parts) {
    if (isJunk(part)) continue;
    const cleaned = cleanSingleNumber(part, city);
    if (cleaned) {
      cleanedParts.push(cleaned);
    }
  }

  if (cleanedParts.length === 0) {
    return { cleaned: null, changed: original !== null };
  }

  const result = cleanedParts.join(", ");
  return { cleaned: result, changed: result !== original };
}

// Main
const doctors = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
const changes = [];

for (const doc of doctors) {
  const { cleaned, changed } = cleanContact(doc.contact, doc.city);
  if (changed) {
    changes.push({
      id: doc.id,
      name: doc.name,
      city: doc.city,
      before: doc.contact,
      after: cleaned,
    });
    doc.contact = cleaned;
  }
}

writeFileSync(DATA_PATH, JSON.stringify(doctors, null, 2) + "\n", "utf-8");

// Print summary
console.log(`\n=== Phone Number Cleanup Summary ===\n`);
console.log(`Total doctors: ${doctors.length}`);
console.log(`Changes made: ${changes.length}\n`);

if (changes.length > 0) {
  console.log("Details:");
  console.log("-".repeat(80));
  for (const c of changes) {
    const before = c.before === null ? "null" : `"${c.before}"`;
    const after = c.after === null ? "null" : `"${c.after}"`;
    console.log(`#${c.id} ${c.name} (${c.city})`);
    console.log(`  ${before}  →  ${after}`);
  }
  console.log("-".repeat(80));
}

console.log("\nDone. doctors.json updated.");
