import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const doctorsPath = join(__dirname, '..', 'src', 'data', 'doctors.json');

const doctors = JSON.parse(readFileSync(doctorsPath, 'utf-8'));

const smallWords = new Set(['and', 'of', 'the', 'in', 'for', 'to', 'at', 'by', 'or', 'from']);

function titleCaseWord(word) {
  if (!word) return word;
  if (word.toLowerCase() === 'dr.') return 'Dr.';
  if (word.toLowerCase() === 'ms.') return 'Ms.';
  if (word.length === 1 && /[a-zA-Z]/.test(word)) return word.toUpperCase();

  // Preserve words that are already all-caps and 2-3 chars (likely abbreviations)
  if (word.length <= 3 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) return word;

  // Handle apostrophe names: "D'Costa" but "Barve's"
  if (word.includes("'")) {
    const aposIdx = word.indexOf("'");
    const before = word.slice(0, aposIdx);
    const after = word.slice(aposIdx + 1);
    const capBefore = before.length > 0
      ? before.charAt(0).toUpperCase() + before.slice(1).toLowerCase()
      : '';
    if (after.length <= 2 && /^s$/i.test(after)) {
      return capBefore + "'" + after.toLowerCase();
    }
    const capAfter = after.length > 0
      ? after.charAt(0).toUpperCase() + after.slice(1).toLowerCase()
      : '';
    return capBefore + "'" + capAfter;
  }

  // Handle hyphenated words
  if (word.includes('-')) {
    return word.split('-').map(part => {
      if (part.length === 0) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join('-');
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function titleCaseSegment(str) {
  const words = str.split(/(\s+)/);
  let wordIdx = 0;
  return words.map(token => {
    if (/^\s+$/.test(token) || token === '') return token;
    const isSmall = smallWords.has(token.toLowerCase());
    const result = (wordIdx > 0 && isSmall) ? token.toLowerCase() : titleCaseWord(token);
    wordIdx++;
    return result;
  }).join('');
}

function cleanName(name) {
  if (!name || name.trim() === '') return name;

  let cleaned = name;

  // Remove empty parentheses "()" or "( )"
  cleaned = cleaned.replace(/\(\s*\)/g, '');

  // Remove trailing commas
  cleaned = cleaned.replace(/,\s*$/, '');

  // Remove trailing hyphens/dashes (with optional +, dots) like "-", "-.", "-+"
  cleaned = cleaned.replace(/\s*[-\u2013\u2014]+[+.]?\s*$/, '');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Split into segments: alternating outside-paren and inside-paren text
  const segments = [];
  let pos = 0;

  while (pos < cleaned.length) {
    const openIdx = cleaned.indexOf('(', pos);
    if (openIdx === -1) {
      segments.push({ type: 'outside', text: cleaned.slice(pos) });
      break;
    }
    if (openIdx > pos) {
      segments.push({ type: 'outside', text: cleaned.slice(pos, openIdx) });
    }
    const closeIdx = cleaned.indexOf(')', openIdx);
    if (closeIdx === -1) {
      segments.push({ type: 'outside', text: cleaned.slice(openIdx) });
      break;
    }
    segments.push({ type: 'paren', text: cleaned.slice(openIdx, closeIdx + 1) });
    pos = closeIdx + 1;
  }

  // Process each segment
  const resultParts = segments.map(seg => {
    if (seg.type === 'paren') {
      const inner = seg.text.slice(1, -1).trim();
      if (inner.length === 0) return '';

      // Handle "/" at start of paren content like "(/Psychotherapist)"
      let processedInner = inner;
      if (processedInner.startsWith('/')) {
        processedInner = '/' + titleCaseSegment(processedInner.slice(1));
      } else {
        processedInner = titleCaseSegment(processedInner);
      }
      return '(' + processedInner + ')';
    } else {
      let text = seg.text;

      // Don't title-case URLs
      if (text.includes('https://') || text.includes('http://') || text.includes('www.')) {
        // Split around the URL and only title-case the non-URL parts
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map(part => {
          if (/^https?:\/\//.test(part) || /^www\./.test(part)) {
            return part; // preserve URL
          }
          // Process non-URL parts - handle "/" as separator if needed
          return processOutsideText(part);
        }).join('');
      }

      return processOutsideText(text);
    }
  });

  cleaned = resultParts.join('');

  // Fix "Dhara Eep" -> "Dharadeep"
  cleaned = cleaned.replace(/\bDhara Eep\b/gi, 'Dharadeep');

  // Clean "-+" artifact in the middle (e.g., "Dr. Vaidehee -+ Therapist" -> "Dr. Vaidehee - Therapist")
  cleaned = cleaned.replace(/\s*-\+\s*/g, ' - ');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

function processOutsideText(text) {
  // Handle "/" as name separator (not in URLs)
  if (text.includes('/') && !text.includes('http') && !text.includes('www')) {
    const parts = text.split('/');
    return parts.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      return titleCaseSegment(trimmed);
    }).join(' / ');
  }
  return titleCaseSegment(text);
}

// Process and track changes
const changes = [];

for (const doctor of doctors) {
  const original = doctor.name;
  const cleaned = cleanName(original);
  if (original !== cleaned) {
    changes.push({ id: doctor.id, before: original, after: cleaned });
    doctor.name = cleaned;
  }
}

// Write back
writeFileSync(doctorsPath, JSON.stringify(doctors, null, 2) + '\n', 'utf-8');

// Print summary
console.log(`\n=== Name Cleaning Summary ===\n`);
console.log(`Total doctors: ${doctors.length}`);
console.log(`Names changed: ${changes.length}\n`);

if (changes.length > 0) {
  console.log('Changes made:\n');
  for (const { id, before, after } of changes) {
    console.log(`  #${id}: "${before}" -> "${after}"`);
  }
}
