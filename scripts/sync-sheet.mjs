#!/usr/bin/env node

/**
 * Fetches the ADHD Doctors Google Sheet and outputs cleaned JSON.
 * Usage: node scripts/sync-sheet.mjs
 */

import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHEET_ID = "1oHLR1pmGHEADWWhkJCcRHnrpr70gELLYsuQPo2e0xbg";
const GID = "421541929"; // "Copy of Docs Filter" sheet — has all cities
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
const OUTPUT_PATH = join(__dirname, "..", "src", "data", "doctors.json");

async function fetchCSV() {
  const res = await fetch(CSV_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
  return res.text();
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
      } else {
        cell += ch;
      }
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function inferType(name) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("psychologist") || lower.includes("therapist")) return "Psychologist";
  if (lower.includes("psychiatrist") || lower.includes("neuropsychiatrist")) return "Psychiatrist";
  if (lower.includes("neuropsychologist")) return "Psychologist";
  if (lower.includes("paediatrician") || lower.includes("pediatrician")) return "Other";
  return "Psychiatrist";
}

function cleanName(raw) {
  if (!raw) return "";
  let name = raw
    // Remove professional titles and suffixes
    .replace(/\.\s*(psychiatrist|psychologist|neuropsychiatrist|neuropsychologist|geriatric psychiatrist|therapist|clinical psychologist)/gi, "")
    .replace(/,?\s*(psychiatrist|psychologist|neuropsychiatrist|neuropsychologist|geriatric psychiatrist|phycatrist|clinical psychologist|psychologicist|nuero psychologist)\s*,?/gi, "")
    .replace(/\s*-\s*(psychiatrist|psychologist|clinical psychologist)\s*$/i, "")
    .replace(/\(psychiatrist\)|\(psychologist\)|\(neuropsychologist\)|\(Psych\)|\(Clinical Psychologist\)|\(therapist\)/gi, "")
    .replace(/,\s*(Psychiatry|Clinical Psychology|Neuropsychiatry)\s*/gi, "")
    .replace(/\s*M\.?D\.?\s*(psychiatry)?\s*/gi, " ")
    .replace(/\s*MRCPsych\s*/gi, " ")
    .replace(/\s*MBBS\s*/gi, " ")
    .replace(/\s*DPM\s*(\(.*?\))?\s*/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .replace(/^,\s*|,\s*$/g, "")
    .replace(/,\s*$/g, "")
    .trim();

  // Title case if ALL CAPS
  if (name === name.toUpperCase() && name.length > 3) {
    name = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Ensure "Dr." prefix
  name = name.replace(/^Dr\.?\s*/i, "Dr. ");
  if (!name.startsWith("Dr.") && !name.match(/^(Ms|Mr|Mrs)\./i)) {
    // Don't add Dr. prefix to psychologists/therapists listed by first name
  }

  return name.trim();
}

function normalizeFee(raw) {
  if (!raw || raw === "-") return null;
  // Handle date-formatted fees (Excel date serial numbers like "6/18/1902")
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(raw.trim())) return null;
  // Handle ranges like "1000-1200" or "1100-1500" — take the lower
  const rangeMatch = raw.match(/(\d[\d,]*)\s*[-–to]+\s*(\d[\d,]*)/);
  if (rangeMatch) {
    const low = parseInt(rangeMatch[1].replace(/,/g, ""), 10);
    const high = parseInt(rangeMatch[2].replace(/,/g, ""), 10);
    if (!isNaN(low) && low >= 10 && low <= 50000) return low;
  }
  // Handle "Rs ~1500", "₹800", "1500/-", "1500 per session", etc.
  const cleaned = raw.replace(/[Rs₹INR~\/\-,.\s]|(per\s*(session|hour|hr))/gi, "").trim();
  // Try to find first number
  const numMatch = cleaned.match(/(\d+)/);
  if (!numMatch) return null;
  const num = parseInt(numMatch[1], 10);
  if (isNaN(num) || num < 10 || num > 50000) return null;
  return num;
}

function normalizeMode(raw) {
  if (!raw) return "Unknown";
  const lower = raw.toLowerCase().trim();
  if (lower === "both") return "Both";
  if (lower === "online") return "Online";
  if (lower === "offline") return "Offline";
  return raw.trim();
}

function normalizeDiagnosis(raw) {
  if (!raw) return "Unknown";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("yes, they conduct standardised")) return "Yes (Standardised Tests)";
  if (lower.includes("yes, but they only do a provisional")) return "Yes (Provisional)";
  if (lower.includes("yes")) return "Yes";
  if (lower.includes("no")) return "No";
  if (lower.includes("don't know") || lower.includes("i don't know")) return "Unknown";
  return "Unknown";
}

function normalizeStimulants(raw) {
  if (!raw) return "Unknown";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("yes, and they prescribe stimulant medication online")) return "Yes";
  if (lower.includes("yes, but they prescribe only on in-person")) return "In-person only";
  if (lower.includes("no, they don't prescribe")) return "No";
  if (lower.includes("don't know") || lower.includes("i don't know")) return "Unknown";
  return "Unknown";
}

function normalizePriorDx(raw) {
  if (!raw) return "Unknown";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("yes, they accept all")) return "Yes";
  if (lower.includes("yes, but they accept only standardised")) return "Standardised reports only";
  if (lower.includes("no")) return "No";
  if (lower.includes("don't know") || lower.includes("i don't know")) return "Unknown";
  return "Unknown";
}

function normalizeAdultSpecialist(raw) {
  if (!raw) return "Unknown";
  const lower = raw.toLowerCase().trim();
  if (lower === "yes") return "Yes";
  if (lower === "no") return "No";
  if (lower.includes("don't know")) return "Unknown";
  return "Unknown";
}

function normalizeCity(raw) {
  if (!raw || raw.trim() === "-") return "Unknown";
  let city = raw.trim()
    .replace(/\s+/g, " ")
    .replace(/^["']|["']$/g, "");

  // Comprehensive city alias map
  const cityMap = {
    "banglore": "Bangalore",
    "bangalore": "Bangalore",
    "bengaluru": "Bangalore",
    "bombay": "Mumbai",
    "gurgaon": "Gurgaon",
    "gurugram": "Gurgaon",
    "trivandrum": "Trivandrum",
    "thiruvananthapuram": "Trivandrum",
    "bhubaneshwar": "Bhubaneswar",
    "bhubaneswar": "Bhubaneswar",
    "noida": "Noida",
    "noids": "Noida",
    "ahemdabad": "Ahmedabad",
    "ahmedabad": "Ahmedabad",
    "gandhinagar": "Ahmedabad",
    "mysuru": "Mysuru",
    "calicut": "Calicut",
    "kolkata": "Kolkata",
    "delhi": "Delhi",
    "new delhi": "Delhi",
    "south delhi": "Delhi",
    "west delhi": "Delhi",
    "mumbai": "Mumbai",
    "navi mumbai": "Navi Mumbai",
    "thane": "Thane",
    "chennai": "Chennai",
    "hyderabad": "Hyderabad",
    "pune": "Pune",
    "lucknow": "Lucknow",
    "jaipur": "Jaipur",
    "kochi": "Kochi",
    "surat": "Surat",
    "nagpur": "Nagpur",
    "chandigarh": "Chandigarh",
    "faridabad": "Faridabad",
    "ghaziabad": "Ghaziabad",
    "goa": "Goa",
    "guwahati": "Guwahati",
    "bhopal": "Bhopal",
    "dehradun": "Dehradun",
    "mathura": "Mathura",
    "kannur": "Kannur",
    "nalbari": "Nalbari",
    "bhilai": "Bhilai",
    "dombivli": "Dombivli",
  };

  // Known area-to-city mappings
  const areaCityMap = {
    "bandra": "Mumbai",
    "borivili": "Mumbai",
    "borivali": "Mumbai",
    "chembur": "Mumbai",
    "ghatkopar": "Mumbai",
    "andheri": "Mumbai",
    "dadar": "Mumbai",
    "lokhandwala": "Mumbai",
    "khargar": "Navi Mumbai",
    "indiranagar": "Bangalore",
    "hebbal": "Bangalore",
    "jayanagar": "Bangalore",
    "koramangala": "Bangalore",
    "bellandur": "Bangalore",
    "whitefield": "Bangalore",
    "anna nagar": "Chennai",
    "t nagar": "Chennai",
    "saligramam": "Chennai",
    "tambaram": "Chennai",
    "kilpauk": "Chennai",
    "aundh": "Pune",
    "kharadi": "Pune",
    "karve nagar": "Pune",
    "lajpat nagar": "Delhi",
    "pitampura": "Delhi",
    "dwarka": "Delhi",
    "vasant vihar": "Delhi",
    "rohini": "Delhi",
    "c.r park delhi": "Delhi",
    "cr park delhi": "Delhi",
    "paschim vihar": "Delhi",
    "janakpuri": "Delhi",
    "safdarjung": "Delhi",
    "indirapuram": "Ghaziabad",
    "banjara hills": "Hyderabad",
    "gachibowli": "Hyderabad",
    "secunderabad": "Hyderabad",
    "hitec city": "Hyderabad",
    "vaishali nagar": "Jaipur",
    "salt lake": "Kolkata",
    "panchkula": "Chandigarh",
    "faridabad sector 16": "Faridabad",
    "sector 56": "Gurgaon",
    "sector 49": "Gurgaon",
  };

  // Clean up the string
  const cleaned = city
    .replace(/\(please google.*?\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Try direct match first
  const directLower = cleaned.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  if (cityMap[directLower]) return cityMap[directLower];
  if (areaCityMap[directLower]) return areaCityMap[directLower];

  // Split by comma and try each part
  const parts = cleaned.split(",").map((s) => s.trim());
  for (const part of parts) {
    const lower = part.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    if (cityMap[lower]) return cityMap[lower];
    if (areaCityMap[lower]) return areaCityMap[lower];
  }

  // Handle "X/Y" patterns like "Gurgaon/Delhi" — take the first
  if (cleaned.includes("/")) {
    const slashParts = cleaned.split("/").map((s) => s.trim());
    for (const part of slashParts) {
      const lower = part.toLowerCase().replace(/[^a-z\s]/g, "").trim();
      if (cityMap[lower]) return cityMap[lower];
    }
  }

  // Handle entries that are actually addresses (contain "hospital", "clinic", etc.)
  const lowerFull = cleaned.toLowerCase();
  if (lowerFull.includes("hospital") || lowerFull.includes("clinic") || lowerFull.includes("aims")) {
    return "Unknown";
  }

  // Handle "medanta, lucknow" style
  if (lowerFull.includes("medanta")) {
    for (const part of parts) {
      const lower = part.toLowerCase().replace(/[^a-z\s]/g, "").trim();
      if (cityMap[lower]) return cityMap[lower];
    }
    return "Lucknow";
  }

  // Fallback: try to match any known city name anywhere in the string
  for (const [alias, canonical] of Object.entries(cityMap)) {
    if (lowerFull.includes(alias)) return canonical;
  }

  // Use first part, title-cased
  let result = parts[0]
    .replace(/\s*\(.*\)\s*/g, "")
    .replace(/\s*(maharashtra|india|uttar pradesh|karnataka|kerala|odisha|telangana|tamil nadu|west bengal|rajasthan|haryana|gujarat|up)\s*/gi, "")
    .trim();

  if (!result || result.length < 2) return "Unknown";
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function classifySentiment(text) {
  if (!text || text.length < 5) return "Neutral";
  const lower = text.toLowerCase();
  const negativeWords = [
    "not recommend", "would not", "smug", "rushed", "inappropriate", "rude",
    "bad experience", "worst", "terrible", "avoid", "dismissive", "insensitive",
    "horrible", "useless", "counterproductive", "ruining", "misconceptions",
  ];
  const positiveWords = [
    "good", "great", "amazing", "excellent", "wonderful", "friendly",
    "easy to talk", "understanding", "helpful", "recommend", "listens",
    "well aware", "updated", "patient", "empathetic", "compassionate",
    "comfortable", "knowledgeable", "phenomenal", "best", "highly recommend",
    "positive", "no stigma", "safe space", "very nice", "super friendly",
    "supportive", "affirming", "thorough", "professional",
  ];

  let score = 0;
  for (const w of positiveWords) if (lower.includes(w)) score++;
  for (const w of negativeWords) if (lower.includes(w)) score -= 1.5;

  if (score >= 1) return "Positive";
  if (score <= -1) return "Negative";
  return "Mixed";
}

function cleanReviewText(raw) {
  if (!raw) return "";
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\.{3,}/g, "...")
    .replace(/\.([A-Z])/g, ". $1")
    .trim();
}

function normalizeOnlinePlatform(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (lower === "idk" || lower === "not sure" || lower === "no idea" || lower === "n/a" || lower === "na") return null;
  if (lower.includes("only offline")) return null;
  return raw.trim();
}

function deduplicateByName(doctors) {
  const map = new Map();
  for (const doc of doctors) {
    // Normalize key: lowercase, remove "dr", remove non-alpha
    const key = doc.name
      .toLowerCase()
      .replace(/^dr\.?\s*/, "")
      .replace(/[^a-z]/g, "");
    if (map.has(key)) {
      const existing = map.get(key);
      // Merge reviews
      existing.reviews.push(...doc.reviews);
      // Prefer non-null values for each field
      for (const field of Object.keys(doc)) {
        if (field === "reviews" || field === "id") continue;
        if (
          (existing[field] === null ||
            existing[field] === "Unknown" ||
            existing[field] === undefined) &&
          doc[field] !== null &&
          doc[field] !== "Unknown" &&
          doc[field] !== undefined
        ) {
          existing[field] = doc[field];
        }
      }
    } else {
      map.set(key, { ...doc });
    }
  }
  return [...map.values()].map((d, i) => ({ ...d, id: i + 1 }));
}

async function main() {
  console.log("Fetching spreadsheet...");
  const csv = await fetchCSV();
  const rows = parseCSV(csv);

  console.log(`Parsed ${rows.length} total rows`);

  // Find header row
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    if (rows[i].some((c) => c && c.includes("Name of the Doctor"))) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    console.error("Could not find header row!");
    process.exit(1);
  }

  // Data rows: skip header, filter out empties
  const dataRows = rows.slice(headerIdx + 1).filter((r) => {
    // Must have a name in column 1
    return r[1] && r[1].trim().length > 1;
  });

  console.log(`Found ${dataRows.length} doctor entries`);

  const doctors = dataRows.map((r, i) => ({
    id: i + 1,
    name: cleanName(r[1] || ""),
    type: inferType(r[1] || ""),
    consultationMode: normalizeMode(r[2]),
    onlinePlatform: normalizeOnlinePlatform(r[3]),
    city: normalizeCity(r[4]),
    address: (r[5] || "").trim(),
    contact: (r[6] || "").replace(/\s+/g, "").trim(),
    fee: normalizeFee(r[7]),
    doesADHDDiagnosis: normalizeDiagnosis(r[8]),
    adhdTestFee: normalizeFee(r[9]),
    prescribesStimulants: normalizeStimulants(r[10]),
    acceptsPreviousDiagnosis: normalizePriorDx(r[11]),
    adultADHDSpecialist: normalizeAdultSpecialist(r[12]),
    reviews: r[13] && r[13].trim().length > 2
      ? [
          {
            sentiment: classifySentiment(r[13]),
            text: cleanReviewText(r[13]),
          },
        ]
      : [],
  }));

  const deduplicated = deduplicateByName(doctors);

  // Stats
  const cities = [...new Set(deduplicated.map((d) => d.city))].sort();
  console.log(`\nAfter deduplication: ${deduplicated.length} doctors`);
  console.log(`Cities (${cities.length}): ${cities.join(", ")}`);

  writeFileSync(OUTPUT_PATH, JSON.stringify(deduplicated, null, 2) + "\n");
  console.log(`\nWrote ${deduplicated.length} doctors to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
