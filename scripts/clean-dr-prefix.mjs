#!/usr/bin/env node
// Ensure consistent Dr. prefix: Psychiatrists get "Dr.", Psychologists don't.
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "../src/data/doctors.json");
const doctors = JSON.parse(readFileSync(filePath, "utf-8"));

const changes = [];

function stripDr(name) {
  return name.replace(/^Dr\.?\s*/i, "").trim();
}

for (const doc of doctors) {
  const original = doc.name;
  const bare = stripDr(doc.name);

  if (doc.type === "Psychiatrist") {
    // Psychiatrists should have "Dr." prefix
    if (!doc.name.match(/^Dr\.?\s/i)) {
      doc.name = `Dr. ${bare}`;
    } else {
      // Normalize to "Dr. " (with period and space)
      doc.name = `Dr. ${bare}`;
    }
  } else {
    // Psychologists (and others) should NOT have "Dr." prefix
    doc.name = bare;
  }

  if (doc.name !== original) {
    changes.push({ id: doc.id, before: original, after: doc.name, type: doc.type });
  }
}

writeFileSync(filePath, JSON.stringify(doctors, null, 2) + "\n");

console.log(`\n=== Dr. Prefix Cleanup ===`);
console.log(`Total changes: ${changes.length}\n`);
for (const c of changes) {
  console.log(`  [${c.type}] "${c.before}" → "${c.after}"`);
}
console.log(`\nDone.`);
