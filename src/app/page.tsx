"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import doctors from "@/data/doctors.json";

type Doctor = (typeof doctors)[number];
type Review = Doctor["reviews"][number];

// --- Icons ---

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// --- Helpers ---

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case "Positive": return "text-positive";
    case "Negative": return "text-negative";
    default: return "text-warning";
  }
}

function getOverallSentiment(reviews: Review[]): string {
  if (reviews.length === 0) return "Unknown";
  const positiveCount = reviews.filter((r) => r.sentiment === "Positive").length;
  const negativeCount = reviews.filter((r) => r.sentiment === "Negative").length;
  if (positiveCount > negativeCount) return "Positive";
  if (negativeCount > positiveCount) return "Negative";
  return "Mixed";
}

// Reverse geocode coordinates to city
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const addr = data.address;
    return addr?.city || addr?.town || addr?.state_district || addr?.state || null;
  } catch {
    return null;
  }
}

// Match a detected city name to our known cities
function matchCity(detected: string): string | null {
  const lower = detected.toLowerCase();
  const aliases: Record<string, string> = {
    "bengaluru": "Bangalore", "bangalore": "Bangalore",
    "mumbai": "Mumbai", "bombay": "Mumbai",
    "new delhi": "Delhi", "delhi": "Delhi", "south delhi": "Delhi", "north delhi": "Delhi", "east delhi": "Delhi", "west delhi": "Delhi", "central delhi": "Delhi",
    "chennai": "Chennai", "madras": "Chennai",
    "kolkata": "Kolkata", "calcutta": "Kolkata",
    "hyderabad": "Hyderabad",
    "pune": "Pune",
    "gurgaon": "Gurgaon", "gurugram": "Gurgaon",
    "noida": "Noida", "greater noida": "Noida",
    "ghaziabad": "Ghaziabad",
    "ahmedabad": "Ahmedabad", "gandhinagar": "Ahmedabad",
    "lucknow": "Lucknow",
    "jaipur": "Jaipur",
    "kochi": "Kochi", "ernakulam": "Kochi",
    "thiruvananthapuram": "Trivandrum", "trivandrum": "Trivandrum",
    "bhubaneswar": "Bhubaneswar",
    "chandigarh": "Chandigarh",
    "surat": "Surat",
    "nagpur": "Nagpur",
    "faridabad": "Faridabad",
    "thane": "Thane",
    "navi mumbai": "Navi Mumbai",
    "mysuru": "Mysuru", "mysore": "Mysuru",
    "bhopal": "Bhopal",
    "dehradun": "Dehradun",
    "goa": "Goa", "panaji": "Goa",
    "guwahati": "Guwahati",
    "mathura": "Mathura",
    "kannur": "Kannur",
    "calicut": "Calicut", "kozhikode": "Calicut",
    "bhilai": "Bhilai",
    "nalbari": "Nalbari",
    "dombivli": "Dombivli",
  };

  // Direct match
  if (aliases[lower]) return aliases[lower];
  // Fuzzy: check if any alias is contained in the detected string
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (lower.includes(alias)) return canonical;
  }
  // Check against our city list directly
  for (const c of cities) {
    if (lower.includes(c.toLowerCase())) return c;
  }
  return null;
}

// --- Filter Options ---

const cities = [...new Set(doctors.map((d) => d.city).filter((c) => c !== "Unknown"))].sort();
const doctorCountByCity = cities.map((c) => ({
  city: c,
  count: doctors.filter((d) => d.city === c).length,
})).sort((a, b) => b.count - a.count);
const consultationModes = ["Online", "Offline", "Both"];
const stimulantOptions = ["Yes", "In-person only", "No"];
const sortOptions = [
  { label: "Name", value: "name" },
  { label: "Price: Low", value: "fee-asc" },
  { label: "Price: High", value: "fee-desc" },
  { label: "Rating", value: "rating" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

// --- Components ---

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "positive" | "negative" | "warning";
}) {
  const base = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap";
  const variants = {
    default: "bg-surface text-muted",
    accent: "bg-accent/10 text-accent",
    positive: "bg-positive/10 text-positive",
    negative: "bg-negative/10 text-negative",
    warning: "bg-warning/10 text-warning",
  };
  return <span className={`${base} ${variants[variant]}`}>{children}</span>;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
        active ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-hover"
      }`}
    >
      {label}
    </button>
  );
}

// --- City Picker Modal ---

function CityPicker({
  onSelect,
  onSkip,
}: {
  onSelect: (city: string) => void;
  onSkip: () => void;
}) {
  const [detecting, setDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredCities = searchQuery
    ? doctorCountByCity.filter((c) =>
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : doctorCountByCity;

  async function detectLocation() {
    setDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const detected = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (detected) {
          const matched = matchCity(detected);
          if (matched) {
            onSelect(matched);
          } else {
            setError(`No doctors listed in "${detected}" yet. Pick a city below.`);
          }
        } else {
          setError("Could not determine your city. Pick one below.");
        }
        setDetecting(false);
      },
      () => {
        setError("Location access denied. Pick a city below.");
        setDetecting(false);
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col px-4 pt-12 pb-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            ADHD India
          </h1>
          <p className="text-muted mt-2 text-sm">
            Find ADHD-friendly doctors near you
          </p>
        </div>

        {/* Auto-detect button */}
        <button
          onClick={detectLocation}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-2xl font-medium text-base transition-colors disabled:opacity-60"
        >
          {detecting ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LocateIcon />
          )}
          {detecting ? "Detecting location..." : "Use my location"}
        </button>

        {error && (
          <p className="text-sm text-negative mt-3 text-center">{error}</p>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted uppercase tracking-wider">or pick a city</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* City search */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            autoFocus
          />
        </div>

        {/* City grid */}
        <div className="flex-1 overflow-y-auto -mx-1">
          <div className="grid grid-cols-2 gap-2 px-1">
            {filteredCities.map(({ city, count }) => (
              <button
                key={city}
                onClick={() => onSelect(city)}
                className="flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-colors text-left"
              >
                <span className="text-sm font-medium text-foreground">{city}</span>
                <span className="text-xs text-muted">{count}</span>
              </button>
            ))}
          </div>
          {filteredCities.length === 0 && (
            <p className="text-center text-muted text-sm py-8">
              No cities match &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          className="mt-4 text-sm text-muted hover:text-foreground font-medium text-center py-2"
        >
          Show all doctors across India
        </button>
      </div>
    </div>
  );
}

// --- Doctor Card ---

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [expanded, setExpanded] = useState(false);
  const overallSentiment = getOverallSentiment(doctor.reviews);
  const sentimentVariant =
    overallSentiment === "Positive" ? "positive"
    : overallSentiment === "Negative" ? "negative"
    : "warning";

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:border-accent/30">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-base leading-tight truncate">
              {doctor.name}
            </h3>
            <p className="text-muted text-sm mt-0.5">{doctor.type}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {doctor.fee && (
              <span className="text-foreground font-semibold text-lg">
                ₹{doctor.fee.toLocaleString("en-IN")}
              </span>
            )}
            <ChevronIcon open={expanded} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 text-muted text-sm">
          <MapPinIcon />
          <span className="truncate">{doctor.city}</span>
          <span className="mx-1 opacity-30">|</span>
          <span>{doctor.consultationMode}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {overallSentiment !== "Unknown" && (
            <Badge variant={sentimentVariant}>
              {overallSentiment === "Positive" ? "Well Reviewed" : "Mixed Reviews"}
            </Badge>
          )}
          {doctor.prescribesStimulants === "Yes" && <Badge variant="accent">Stimulants</Badge>}
          {doctor.prescribesStimulants === "In-person only" && <Badge variant="default">Stimulants (In-person)</Badge>}
          {doctor.adultADHDSpecialist === "Yes" && <Badge variant="positive">Adult ADHD</Badge>}
          {doctor.acceptsPreviousDiagnosis === "Yes" && <Badge variant="default">Accepts Prior Dx</Badge>}
          {(doctor.doesADHDDiagnosis === "Yes" || doctor.doesADHDDiagnosis === "Yes (Standardised Tests)" || doctor.doesADHDDiagnosis === "Yes (Provisional)") && (
            <Badge variant="default">ADHD Testing</Badge>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Address</p>
            <p className="text-sm text-foreground leading-relaxed">{doctor.address}</p>
          </div>

          {doctor.contact && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Contact</p>
              <a href={`tel:${doctor.contact}`} className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium">
                <PhoneIcon />
                {doctor.contact}
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {doctor.onlinePlatform && (
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-0.5">Online Platform</p>
                <p className="text-sm text-foreground">{doctor.onlinePlatform}</p>
              </div>
            )}
            {doctor.adhdTestFee && (
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-0.5">ADHD Test Fee</p>
                <p className="text-sm text-foreground">₹{doctor.adhdTestFee.toLocaleString("en-IN")}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-0.5">Stimulants</p>
              <p className="text-sm text-foreground">{doctor.prescribesStimulants}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-0.5">Prior Diagnosis</p>
              <p className="text-sm text-foreground">{doctor.acceptsPreviousDiagnosis}</p>
            </div>
          </div>

          {doctor.reviews.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                Reviews ({doctor.reviews.length})
              </p>
              <div className="space-y-3">
                {doctor.reviews.map((review, i) => (
                  <div key={i} className="bg-background rounded-xl p-3 border border-border">
                    <span className={`text-xs font-semibold ${getSentimentColor(review.sentiment)}`}>
                      {review.sentiment}
                    </span>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Main Page ---

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [stimulants, setStimulants] = useState<string | null>(null);
  const [adultADHD, setAdultADHD] = useState(false);
  const [acceptsPrior, setAcceptsPrior] = useState(false);
  const [doesDiagnosis, setDoesDiagnosis] = useState(false);
  const [sort, setSort] = useState<SortValue>("rating");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    // If user previously selected a city, restore it
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setCity(savedCity === "all" ? null : savedCity);
      setShowCityPicker(false);
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const handleCitySelect = useCallback((selectedCity: string) => {
    setCity(selectedCity);
    setShowCityPicker(false);
    localStorage.setItem("selectedCity", selectedCity);
  }, []);

  const handleCitySkip = useCallback(() => {
    setCity(null);
    setShowCityPicker(false);
    localStorage.setItem("selectedCity", "all");
  }, []);

  const filtered = useMemo(() => {
    let result = [...doctors];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q)
      );
    }

    if (city) result = result.filter((d) => d.city === city);
    if (mode) {
      result = result.filter((d) => d.consultationMode === mode || d.consultationMode === "Both");
    }
    if (stimulants) {
      if (stimulants === "Yes") {
        result = result.filter((d) => d.prescribesStimulants === "Yes" || d.prescribesStimulants === "In-person only");
      } else {
        result = result.filter((d) => d.prescribesStimulants === stimulants);
      }
    }
    if (adultADHD) result = result.filter((d) => d.adultADHDSpecialist === "Yes");
    if (acceptsPrior) {
      result = result.filter(
        (d) => d.acceptsPreviousDiagnosis === "Yes" || d.acceptsPreviousDiagnosis === "Standardised reports only"
      );
    }
    if (doesDiagnosis) {
      result = result.filter(
        (d) =>
          d.doesADHDDiagnosis === "Yes" ||
          d.doesADHDDiagnosis === "Yes (Standardised Tests)" ||
          d.doesADHDDiagnosis === "Yes (Provisional)"
      );
    }

    result.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "fee-asc":
          return (a.fee ?? Infinity) - (b.fee ?? Infinity);
        case "fee-desc":
          return (b.fee ?? 0) - (a.fee ?? 0);
        case "rating": {
          const scoreA = a.reviews.filter((r) => r.sentiment === "Positive").length / (a.reviews.length || 1);
          const scoreB = b.reviews.filter((r) => r.sentiment === "Positive").length / (b.reviews.length || 1);
          return scoreB - scoreA;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [search, city, mode, stimulants, adultADHD, acceptsPrior, doesDiagnosis, sort]);

  const activeFilterCount =
    (mode ? 1 : 0) + (stimulants ? 1 : 0) +
    (adultADHD ? 1 : 0) + (acceptsPrior ? 1 : 0) + (doesDiagnosis ? 1 : 0);

  function clearFilters() {
    setMode(null);
    setStimulants(null);
    setAdultADHD(false);
    setAcceptsPrior(false);
    setDoesDiagnosis(false);
    setSearch("");
  }

  function changeCity() {
    localStorage.removeItem("selectedCity");
    setShowCityPicker(true);
  }

  // City picker on first load
  if (showCityPicker) {
    return <CityPicker onSelect={handleCitySelect} onSkip={handleCitySkip} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                ADHD India
              </h1>
              <button
                onClick={changeCity}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
              >
                <MapPinIcon />
                {city || "All cities"}
                <span className="text-muted">- change</span>
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-surface hover:bg-surface-hover transition-colors text-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search doctors, cities, hospitals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Active city + Quick filters row */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
            {city && (
              <button
                onClick={() => { setCity(null); localStorage.setItem("selectedCity", "all"); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-accent text-white whitespace-nowrap shrink-0"
              >
                {city}
                <CrossIcon />
              </button>
            )}
            <FilterChip
              label={stimulants ? "Stimulants ✓" : "Stimulants"}
              active={stimulants !== null}
              onClick={() => setStimulants(stimulants ? null : "Yes")}
            />
            <FilterChip
              label={adultADHD ? "Adult ADHD ✓" : "Adult ADHD"}
              active={adultADHD}
              onClick={() => setAdultADHD(!adultADHD)}
            />
            <FilterChip
              label={mode === "Online" ? "Online ✓" : "Online"}
              active={mode === "Online"}
              onClick={() => setMode(mode === "Online" ? null : "Online")}
            />
          </div>

          {/* Filter + Sort row */}
          <div className="flex items-center justify-between mt-2 gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:bg-surface-hover"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
              </svg>
              All Filters
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortValue)}
                className="bg-surface border border-border rounded-lg text-sm text-foreground px-2 py-1 focus:outline-none focus:border-accent appearance-none cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-surface border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
            {/* Consultation Mode */}
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Consultation Mode</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="Any" active={mode === null} onClick={() => setMode(null)} />
                {consultationModes.map((m) => (
                  <FilterChip key={m} label={m} active={mode === m} onClick={() => setMode(mode === m ? null : m)} />
                ))}
              </div>
            </div>

            {/* Stimulants */}
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Prescribes Stimulants</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="Any" active={stimulants === null} onClick={() => setStimulants(null)} />
                {stimulantOptions.map((s) => (
                  <FilterChip key={s} label={s} active={stimulants === s} onClick={() => setStimulants(stimulants === s ? null : s)} />
                ))}
              </div>
            </div>

            {/* Toggle filters */}
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Adult ADHD Specialist" active={adultADHD} onClick={() => setAdultADHD(!adultADHD)} />
              <FilterChip label="Accepts Prior Diagnosis" active={acceptsPrior} onClick={() => setAcceptsPrior(!acceptsPrior)} />
              <FilterChip label="Does ADHD Testing" active={doesDiagnosis} onClick={() => setDoesDiagnosis(!doesDiagnosis)} />
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-accent hover:text-accent-hover font-medium">
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <main className="max-w-lg mx-auto px-4 py-4">
        <p className="text-sm text-muted mb-3">
          {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
          {city ? ` in ${city}` : ""}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No doctors match your filters</p>
            <button onClick={clearFilters} className="mt-3 text-accent hover:text-accent-hover text-sm font-medium">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        <footer className="mt-12 pb-8 text-center">
          <p className="text-xs text-muted">Data sourced from community contributions.</p>
          <p className="text-xs text-muted mt-1">
            Have a doctor to add?{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1oHLR1pmGHEADWWhkJCcRHnrpr70gELLYsuQPo2e0xbg/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover"
            >
              Contribute to the spreadsheet
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
