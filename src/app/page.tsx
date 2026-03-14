"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Stethoscope, Brain, Video, Hospital, Pill, UserCheck, ClipboardCheck, FileCheck, ArrowUpAZ, ArrowUpNarrowWide, ArrowDownNarrowWide } from "lucide-react";
import doctors from "@/data/doctors.json";

type Doctor = (typeof doctors)[number];
type Review = Doctor["reviews"][number];

// --- Icons (inline SVG, no external library) ---

// Fidget spinner - supports 2 or 3 spokes
function FidgetSpinnerIcon({ size = 24, className = "", spokes = 3 }: { size?: number; className?: string; spokes?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      {/* Center circle */}
      <circle cx="50" cy="50" r="10" fill="currentColor" />
      <circle cx="50" cy="50" r="7" fill="var(--background, #fff)" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      {spokes === 3 ? (
        <>
          {/* Top lobe (pointing up) */}
          <ellipse cx="50" cy="24" rx="12" ry="14" fill="currentColor" opacity="0.85" />
          <circle cx="50" cy="20" r="6" fill="var(--background, #fff)" />
          <circle cx="50" cy="20" r="3" fill="currentColor" />
          <rect x="46" y="24" width="8" height="18" rx="4" fill="currentColor" opacity="0.7" />
          {/* Bottom-left lobe */}
          <ellipse cx="27.5" cy="63" rx="12" ry="14" fill="currentColor" opacity="0.85" transform="rotate(-30 27.5 63)" />
          <circle cx="25" cy="66" r="6" fill="var(--background, #fff)" />
          <circle cx="25" cy="66" r="3" fill="currentColor" />
          <rect x="30" y="52" width="8" height="18" rx="4" fill="currentColor" opacity="0.7" transform="rotate(60 34 61)" />
          {/* Bottom-right lobe */}
          <ellipse cx="72.5" cy="63" rx="12" ry="14" fill="currentColor" opacity="0.85" transform="rotate(30 72.5 63)" />
          <circle cx="75" cy="66" r="6" fill="var(--background, #fff)" />
          <circle cx="75" cy="66" r="3" fill="currentColor" />
          <rect x="62" y="52" width="8" height="18" rx="4" fill="currentColor" opacity="0.7" transform="rotate(-60 66 61)" />
        </>
      ) : (
        <>
          {/* Top lobe */}
          <ellipse cx="50" cy="24" rx="12" ry="14" fill="currentColor" opacity="0.85" />
          <circle cx="50" cy="20" r="6" fill="var(--background, #fff)" />
          <circle cx="50" cy="20" r="3" fill="currentColor" />
          <rect x="46" y="24" width="8" height="18" rx="4" fill="currentColor" opacity="0.7" />
          {/* Bottom lobe */}
          <ellipse cx="50" cy="76" rx="12" ry="14" fill="currentColor" opacity="0.85" />
          <circle cx="50" cy="80" r="6" fill="var(--background, #fff)" />
          <circle cx="50" cy="80" r="3" fill="currentColor" />
          <rect x="46" y="58" width="8" height="18" rx="4" fill="currentColor" opacity="0.7" />
        </>
      )}
    </svg>
  );
}

function emitParticles(button: HTMLElement, level: number) {
  const rect = button.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  if (level === 1) {
    // Subtle: few monochrome amber sparks
    const count = 5;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 25 + Math.random() * 30;
      const s = 2 + Math.random() * 2;
      Object.assign(el.style, {
        position: "fixed", left: `${cx}px`, top: `${cy}px`,
        width: `${s}px`, height: `${s}px`, borderRadius: "50%",
        background: `hsl(35, 80%, 60%)`,
        pointerEvents: "none", zIndex: "9999", transition: "none",
      });
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        Object.assign(el.style, {
          transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.3, 1)",
          transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`,
          opacity: "0",
        });
      });
      setTimeout(() => el.remove(), 600);
    }
  } else if (level === 2) {
    // Warm sparks: orange/amber, more of them
    const count = 10;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 35 + Math.random() * 50;
      const s = 2 + Math.random() * 3;
      Object.assign(el.style, {
        position: "fixed", left: `${cx}px`, top: `${cy}px`,
        width: `${s}px`, height: `${s}px`, borderRadius: "50%",
        background: `hsl(${25 + Math.random() * 20}, 100%, ${55 + Math.random() * 15}%)`,
        boxShadow: "0 0 4px rgba(255,180,50,0.6)",
        pointerEvents: "none", zIndex: "9999", transition: "none",
      });
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        Object.assign(el.style, {
          transition: "all 0.6s cubic-bezier(0.2, 0.8, 0.3, 1)",
          transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`,
          opacity: "0",
        });
      });
      setTimeout(() => el.remove(), 700);
    }
  } else if (level === 3) {
    // Colorful sparks: a few rainbow colors
    const count = 16;
    const hues = [0, 45, 60, 200, 280];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 40 + Math.random() * 60;
      const s = 3 + Math.random() * 3;
      const hue = hues[Math.floor(Math.random() * hues.length)];
      Object.assign(el.style, {
        position: "fixed", left: `${cx}px`, top: `${cy}px`,
        width: `${s}px`, height: `${s}px`, borderRadius: "50%",
        background: `hsl(${hue}, 90%, 60%)`,
        boxShadow: `0 0 6px hsla(${hue}, 90%, 60%, 0.5)`,
        pointerEvents: "none", zIndex: "9999", transition: "none",
      });
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        Object.assign(el.style, {
          transition: "all 0.8s cubic-bezier(0.15, 0.8, 0.3, 1)",
          transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`,
          opacity: "0",
        });
      });
      setTimeout(() => el.remove(), 900);
    }
  } else {
    // Full confetti: max color, lots of particles
    const count = level >= 5 ? 40 : 26;
    const hues = [0, 30, 50, 120, 200, 270, 310, 45, 170];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const dist = 50 + Math.random() * (level >= 5 ? 140 : 90);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist + 30 + Math.random() * 40;
      const w = 4 + Math.random() * 6;
      const h = 6 + Math.random() * 10;
      const hue = hues[Math.floor(Math.random() * hues.length)];
      const rot = Math.random() * 720 - 360;
      Object.assign(el.style, {
        position: "fixed", left: `${cx}px`, top: `${cy}px`,
        width: `${w}px`, height: `${h}px`,
        borderRadius: Math.random() > 0.5 ? "1px" : "50%",
        background: `hsl(${hue}, 85%, ${50 + Math.random() * 20}%)`,
        pointerEvents: "none", zIndex: "9999", transition: "none",
      });
      document.body.appendChild(el);
      const dur = 0.8 + Math.random() * 0.6;
      requestAnimationFrame(() => {
        Object.assign(el.style, {
          transition: `all ${dur}s cubic-bezier(0.1, 0.7, 0.3, 1)`,
          transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(0.3)`,
          opacity: "0",
        });
      });
      setTimeout(() => el.remove(), (dur + 0.1) * 1000);
    }
  }
}

function emitSmoke(button: HTMLElement, thickness: number) {
  const rect = button.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const count = 3 + Math.floor(thickness * 3);
  const baseSize = 15 + thickness * 12;
  const baseOpacity = 0.15 + thickness * 0.08;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const s = baseSize + Math.random() * baseSize;
    const drift = (Math.random() - 0.5) * 40;
    Object.assign(el.style, {
      position: "fixed",
      left: `${cx - s / 2 + (Math.random() - 0.5) * 20}px`,
      top: `${cy - s / 2}px`,
      width: `${s}px`, height: `${s}px`, borderRadius: "50%",
      background: `rgba(120, 120, 120, ${baseOpacity})`,
      filter: `blur(${6 + thickness * 4}px)`,
      pointerEvents: "none", zIndex: "9998", transition: "none",
    });
    document.body.appendChild(el);
    const dur = 1 + Math.random() * 0.8;
    requestAnimationFrame(() => {
      Object.assign(el.style, {
        transition: `all ${dur}s cubic-bezier(0.1, 0.4, 0.2, 1)`,
        transform: `translate(${drift}px, ${-40 - Math.random() * 60}px) scale(${1.5 + thickness * 0.5})`,
        opacity: "0",
      });
    });
    setTimeout(() => el.remove(), (dur + 0.1) * 1000);
  }
}

let shakeRaf = 0;
function screenShake(intensity = 4, duration = 400) {
  cancelAnimationFrame(shakeRaf);
  const el = document.documentElement;
  const start = performance.now();
  function shake(now: number) {
    const t = now - start;
    if (t > duration) { el.style.transform = ""; return; }
    const decay = 1 - t / duration;
    const x = (Math.random() - 0.5) * 2 * intensity * decay;
    const y = (Math.random() - 0.5) * 2 * intensity * decay;
    el.style.transform = `translate(${x}px, ${y}px)`;
    shakeRaf = requestAnimationFrame(shake);
  }
  shakeRaf = requestAnimationFrame(shake);
}

function emitFireworks() {
  const positions = [
    { x: 0.2 + Math.random() * 0.2, y: 0.2 + Math.random() * 0.3 },
    { x: 0.6 + Math.random() * 0.2, y: 0.15 + Math.random() * 0.3 },
    { x: 0.35 + Math.random() * 0.3, y: 0.1 + Math.random() * 0.2 },
  ];
  const hues = [0, 45, 120, 200, 280, 330];

  positions.forEach((pos, pi) => {
    setTimeout(() => {
      const cx = window.innerWidth * pos.x;
      const cy = window.innerHeight * pos.y;
      const count = 24;
      const baseHue = hues[Math.floor(Math.random() * hues.length)];

      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const dist = 60 + Math.random() * 100;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist + 20;
        const s = 3 + Math.random() * 4;
        const hue = baseHue + Math.random() * 40 - 20;
        Object.assign(el.style, {
          position: "fixed", left: `${cx}px`, top: `${cy}px`,
          width: `${s}px`, height: `${s}px`, borderRadius: "50%",
          background: `hsl(${hue}, 90%, 65%)`,
          boxShadow: `0 0 8px hsl(${hue}, 90%, 65%), 0 0 16px hsl(${hue}, 90%, 50%)`,
          pointerEvents: "none", zIndex: "9999", transition: "none",
        });
        document.body.appendChild(el);
        requestAnimationFrame(() => {
          Object.assign(el.style, {
            transition: `all ${0.8 + Math.random() * 0.5}s cubic-bezier(0.15, 0.7, 0.3, 1)`,
            transform: `translate(${tx}px, ${ty}px) scale(0)`,
            opacity: "0",
          });
        });
        setTimeout(() => el.remove(), 1500);
      }
    }, pi * 300);
  });
}

function showAdhdNudge(onDismiss?: () => void) {
  const headings = [
    "Dopamine unlocked!",
    "Achievement unlocked!",
    "Hyperfocus detected!",
    "Stim complete!",
    "Brain go brrr!",
  ];
  const messages = [
    "Okay you've had your fun... now back to what you were doing!",
    "Your brain enjoyed that. Now channel that energy into your task!",
    "Stimulation achieved. Time to refocus, you got this!",
    "That was a solid break. Your task is missing you.",
    "Dopamine topped up. Now go crush whatever you were working on!",
  ];
  const heading = headings[Math.floor(Math.random() * headings.length)];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", display: "flex",
    alignItems: "center", justifyContent: "center",
    zIndex: "10000", pointerEvents: "auto",
    background: "rgba(0,0,0,0.4)",
  });

  const box = document.createElement("div");
  Object.assign(box.style, {
    padding: "24px 32px", borderRadius: "16px",
    background: "rgba(0,0,0,0.85)", color: "#fff",
    textAlign: "center", maxWidth: "340px",
    opacity: "0", transform: "translateY(20px) scale(0.95)",
    transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.3, 1)",
    display: "flex", flexDirection: "column", gap: "16px",
    userSelect: "none", WebkitUserSelect: "none",
  });

  const title = document.createElement("p");
  Object.assign(title.style, {
    fontSize: "20px", fontWeight: "700", lineHeight: "1.2", margin: "0",
  });
  title.textContent = heading;
  box.appendChild(title);

  const text = document.createElement("p");
  Object.assign(text.style, {
    fontSize: "15px", fontWeight: "400", lineHeight: "1.5", margin: "0",
    opacity: "0.8",
  });
  text.textContent = msg;
  box.appendChild(text);

  const btn = document.createElement("button");
  Object.assign(btn.style, {
    padding: "8px 20px", borderRadius: "999px",
    background: "rgba(255,255,255,0.15)", color: "#fff",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "background 0.2s",
  });
  btn.textContent = "Lol, OK";
  btn.onmouseenter = () => { btn.style.background = "rgba(255,255,255,0.25)"; };
  btn.onmouseleave = () => { btn.style.background = "rgba(255,255,255,0.15)"; };
  box.appendChild(btn);

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    box.style.opacity = "0";
    box.style.transform = "translateY(-10px) scale(0.95)";
    setTimeout(() => { overlay.remove(); onDismiss?.(); }, 500);
  }

  btn.onclick = dismiss;

  requestAnimationFrame(() => {
    box.style.opacity = "1";
    box.style.transform = "translateY(0) scale(1)";
  });

  // No auto-dismiss — user must click the button
}

function SpinningLogo({ size = 24, onClick, initialVelocity = 0 }: { size?: number; onClick?: () => void; initialVelocity?: number }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const velocity = useRef(initialVelocity);
  const animating = useRef(false);
  const raf = useRef(0);
  const lastTime = useRef(0);
  const clicks = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [spokes, setSpokes] = useState(3);

  function resetSpinner() {
    cancelAnimationFrame(raf.current);
    velocity.current = 0;
    angle.current = 0;
    animating.current = false;
    clicks.current = 0;
    setSpokes(3);
    if (divRef.current) {
      divRef.current.style.transform = `rotate(0deg)`;
      divRef.current.style.filter = "";
    }
  }

  function tick(now: number) {
    const dt = Math.min((now - lastTime.current) / 1000, 0.05);
    lastTime.current = now;
    velocity.current *= 0.97;
    angle.current += velocity.current * dt;
    if (divRef.current) divRef.current.style.transform = `rotate(${angle.current}deg)`;
    if (velocity.current < 2) {
      velocity.current = 0;
      animating.current = false;
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!animating.current && velocity.current > 0) {
      animating.current = true;
      lastTime.current = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
  }

  const didInit = useRef(false);
  const divRefCallback = useCallback((node: HTMLDivElement | null) => {
    divRef.current = node;
    if (node && initialVelocity > 0 && !didInit.current) {
      didInit.current = true;
      velocity.current = initialVelocity;
      animating.current = false; // reset in case strict mode re-ran
      requestAnimationFrame(() => startLoop());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVelocity]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(idleTimer.current);
    };
  }, []);

  function handleClick() {
    // Reset idle timer on every click
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(resetSpinner, 2000);

    velocity.current = Math.min(velocity.current + 1800, 18000);
    startLoop();

    clicks.current += 1;
    const n = clicks.current;
    const btn = buttonRef.current;

    // Stage 1 (5-8): subtle amber sparks
    if (n >= 5 && n < 9 && btn) emitParticles(btn, 1);
    // Stage 2 (9-13): warmer, more sparks
    if (n >= 9 && n < 14 && btn) emitParticles(btn, 2);
    // Stage 3 (14-19): colorful sparks
    if (n >= 14 && n < 20 && btn) emitParticles(btn, 3);
    // Stage 4 (20): full confetti burst
    if (n === 20 && btn) { emitParticles(btn, 4); emitFireworks(); screenShake(4); }
    // Stage 5 (21-30): smoke phase — switch to 2 spokes, smoke gets thicker
    if (n >= 21 && btn) {
      if (n === 21) setSpokes(2);
      const thickness = (n - 20) / 10; // 0.1 to 1.0
      emitSmoke(btn, thickness);
      if (n >= 25) screenShake(2 + thickness * 6);
    }
    if (n === 30) {
      clearTimeout(idleTimer.current);
      if (divRef.current) {
        divRef.current.style.filter = "drop-shadow(0 0 12px gold) drop-shadow(0 0 24px orange)";
      }
      showAdhdNudge(resetSpinner);
    }

    onClick?.();
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="text-accent touch-none select-none cursor-pointer"
      aria-label="Logo"
    >
      <div ref={divRefCallback}>
        <FidgetSpinnerIcon size={size} spokes={spokes} />
      </div>
    </button>
  );
}

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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// Wizard step icons
function LocationPinLargeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FilterLargeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function UsersLargeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Step 2 card icons


function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.327.327 0 0 0-.462 0c-.545.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.231-.094z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
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
  const mixedCount = reviews.filter((r) => r.sentiment === "Mixed").length;
  if (positiveCount > negativeCount) return "Positive";
  if (negativeCount > positiveCount) return "Negative";
  if (mixedCount > 0) return "Mixed";
  if (positiveCount === 0 && negativeCount === 0) return "Neutral";
  return "Mixed";
}

function extractBestPhone(raw: string): string | null {
  const parts = raw.split(",").map((s) => s.trim());
  // Pick the last non-discontinued number
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!/discontinued/i.test(parts[i])) {
      return parts[i].replace(/\D/g, "");
    }
  }
  // fallback: last number's digits
  const last = parts[parts.length - 1];
  const digits = last.replace(/\D/g, "");
  return digits || null;
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
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
    return addr?.city || addr?.town || addr?.county || addr?.suburb || addr?.village || addr?.state_district || addr?.state || null;
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

  if (aliases[lower]) return aliases[lower];
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (lower.includes(alias)) return canonical;
  }
  for (const c of cities) {
    if (lower.includes(c.toLowerCase())) return c;
  }
  return null;
}

// --- Filter Options ---

const cityCountMap = doctors.reduce((acc, d) => {
  if (d.city !== "Unknown") acc[d.city] = (acc[d.city] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
const cities = Object.keys(cityCountMap).sort();
const doctorCountByCity = Object.entries(cityCountMap)
  .map(([city, count]) => ({ city, count }))
  .sort((a, b) => b.count - a.count);
const consultationModes = ["Online", "Offline", "Both"];
const stimulantOptions = ["Yes", "In-person only", "No"];
const sortOptions = [
  { label: "Rating: High", value: "rating-desc" },
  { label: "Rating: Low", value: "rating-asc" },
  { label: "Price: Low", value: "fee-asc" },
  { label: "Price: High", value: "fee-desc" },
  { label: "Name", value: "name" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

// --- Wizard preference options ---

type PreferenceKey = "psychiatrist" | "psychologist" | "online" | "inPerson" | "stimulants" | "adultADHD" | "acceptsPrior" | "doesDiagnosis";
type DrawerType = "correction" | "review" | "new-doctor";
type DrawerContext = {
  type: DrawerType;
  doctorName?: string;
  doctorId?: number;
  city?: string;
};

const preferenceCards: { key: PreferenceKey; label: string; description: string; icon: React.ReactNode }[] = [
  { key: "psychiatrist", label: "Psychiatrist", description: "Can prescribe medication", icon: <Stethoscope size={24} strokeWidth={1.5} /> },
  { key: "psychologist", label: "Psychologist", description: "Therapy & testing", icon: <Brain size={24} strokeWidth={1.5} /> },
  { key: "online", label: "Online", description: "Video consultations", icon: <Video size={24} strokeWidth={1.5} /> },
  { key: "inPerson", label: "In-person", description: "Visit the clinic", icon: <Hospital size={24} strokeWidth={1.5} /> },
  { key: "stimulants", label: "Stimulants", description: "Prescribes Ritalin, etc.", icon: <Pill size={24} strokeWidth={1.5} /> },
  { key: "adultADHD", label: "Adult ADHD", description: "Specializes in adults", icon: <UserCheck size={24} strokeWidth={1.5} /> },
  { key: "acceptsPrior", label: "Prior Dx", description: "Honors past diagnoses", icon: <FileCheck size={24} strokeWidth={1.5} /> },
  { key: "doesDiagnosis", label: "ADHD Testing", description: "Can diagnose ADHD", icon: <ClipboardCheck size={24} strokeWidth={1.5} /> },
];

// --- Components ---

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "positive" | "negative" | "warning" | "purple";
}) {
  const base = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap";
  const variants = {
    default: "bg-gray-100 text-gray-500 dark:bg-surface dark:text-muted",
    accent: "bg-accent/10 text-accent/80 dark:bg-accent/10 dark:text-accent/70",
    positive: "bg-green-50 text-green-600/80 dark:bg-green-900/15 dark:text-green-400/60",
    negative: "bg-red-50 text-red-600/80 dark:bg-red-900/15 dark:text-red-400/60",
    warning: "bg-amber-50 text-amber-600/80 dark:bg-amber-900/15 dark:text-amber-400/60",
    purple: "bg-blue-50 text-blue-700/80 dark:bg-blue-900/15 dark:text-blue-300/60",
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

function SegmentedControl({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 border border-border rounded-full bg-background">
      {children}
    </div>
  );
}

function SegmentChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
        active ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// --- Progress Bar ---

function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-1 bg-surface">
      <div
        className="h-full bg-accent transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// --- Wizard Step 1: Welcome ---

function WelcomeStep({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col h-screen-safe bg-background">
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 py-12 overflow-y-auto">
        {/* Logo / Title */}
        <div className="mb-12">
          <div className="mb-6">
            <SpinningLogo size={48} />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
            Find your<br />ADHD Doctor
          </h1>
          <p className="text-muted mt-3 text-base leading-relaxed">
            Discover ADHD-friendly psychiatrists and psychologists across India, curated by the community.
          </p>
        </div>

        {/* Info items */}
        <div className="space-y-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-accent">
              <LocationPinLargeIcon />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Tell us your location</p>
              <p className="text-muted text-sm mt-0.5">We&apos;ll find doctors near you</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-accent">
              <FilterLargeIcon />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Choose what matters</p>
              <p className="text-muted text-sm mt-0.5">Filter by what&apos;s important to you</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-accent">
              <UsersLargeIcon />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Browse &amp; connect</p>
              <p className="text-muted text-sm mt-0.5">Find the right doctor for you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="shrink-0 max-w-lg mx-auto w-full px-6 pb-8 pt-4">
        <button
          onClick={onGetStarted}
          className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-full font-semibold text-base transition-colors"
        >
          Get Started
        </button>
        <p className="text-center text-xs text-muted mt-4">
          {doctors.length} doctors across {cities.length} cities
        </p>
      </div>
    </div>
  );
}

// --- Wizard Step 1b: Location Selection ---

function LocationStep({
  onSelect,
  onSkip,
  onBack,
}: {
  onSelect: (city: string) => void;
  onSkip: () => void;
  onBack: () => void;
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
      (err) => {
        if (err.code === 1) {
          setError("Location access denied. Pick a city below.");
        } else if (err.code === 3) {
          setError("Location request timed out. Pick a city below.");
        } else {
          setError("Could not determine location. Pick a city below.");
        }
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  }

  return (
    <div className="flex flex-col h-screen-safe bg-background">
      <ProgressBar step={1} totalSteps={3} />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 pt-5 pb-3 overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Where are you located?
          </h2>
          <p className="text-muted mt-1 text-sm">
            We&apos;ll find doctors near you
          </p>
        </div>

        {/* Auto-detect button */}
        <button
          onClick={detectLocation}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-2.5 py-3 bg-accent hover:bg-accent-hover text-white rounded-full font-medium text-base transition-colors disabled:opacity-60"
        >
          {detecting ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LocateIcon />
          )}
          {detecting ? "Detecting location..." : "Use my location"}
        </button>

        {error && (
          <p className="text-sm text-negative mt-2 text-center">{error}</p>
        )}

        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted uppercase tracking-wider">or pick a city</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* City search */}
        <div className="relative mb-3">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-full text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* City grid */}
        <div className="flex-1 overflow-y-auto -mx-1">
          <div className="grid grid-cols-2 gap-1.5 px-1">
            {filteredCities.map(({ city, count }) => (
              <button
                key={city}
                onClick={() => onSelect(city)}
                className="flex items-center justify-between px-3.5 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-colors text-left"
              >
                <span className="text-sm font-medium text-foreground">{city}</span>
                <span className="text-xs text-muted">{count}</span>
              </button>
            ))}
          </div>
          {filteredCities.length === 0 && (
            <p className="text-center text-muted text-sm py-6">
              No cities match &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 max-w-lg mx-auto w-full px-4 pb-5 pt-2">
        <button
          onClick={onSkip}
          className="w-full text-sm text-muted hover:text-foreground font-medium text-center py-1.5 mb-2"
        >
          Show all cities
        </button>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 border border-border text-foreground rounded-full font-medium text-sm transition-colors hover:bg-surface flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Wizard Step 2: Preferences ---

function PreferencesStep({
  selectedPrefs,
  onToggle,
  onBack,
  onNext,
}: {
  selectedPrefs: Set<PreferenceKey>;
  onToggle: (key: PreferenceKey) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col h-screen-safe bg-background">
      <ProgressBar step={2} totalSteps={3} />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 pt-5 pb-3 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            What are you looking for?
          </h2>
          <p className="text-muted mt-1 text-sm">
            Select all that apply. You can change these later.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 flex-1 content-start">
          {preferenceCards.map(({ key, label, description, icon }) => {
            const isSelected = selectedPrefs.has(key);
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-accent bg-accent/15"
                    : "border-border bg-surface hover:border-accent/30 hover:bg-surface-hover"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected ? "bg-accent/25 text-accent" : "bg-background text-muted"
                }`}>
                  {icon}
                </div>
                <p className={`font-semibold text-sm ${isSelected ? "text-accent" : "text-foreground"}`}>
                  {label}
                </p>
                <p className="text-xs text-muted mt-0.5 leading-snug">
                  {description}
                </p>
              </button>
            );
          })}
        </div>

        <button
          onClick={onNext}
          className="text-sm text-accent hover:underline font-medium text-center mt-4 mb-1"
        >
          See all doctors &rarr;
        </button>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 max-w-lg mx-auto w-full px-4 pb-5 pt-2">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 border border-border text-foreground rounded-full font-medium text-sm transition-colors hover:bg-surface flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon />
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-[2] py-3 bg-accent hover:bg-accent-hover text-white rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            See Results
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Doctor Card ---

function DoctorCard({ doctor, onAction }: { doctor: Doctor; onAction: (type: DrawerType) => void }) {
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
          <span className="truncate">{doctor.locality ? `${doctor.locality}, ${doctor.city}` : doctor.city}</span>
          <span className="mx-1 opacity-30">|</span>
          <span>{doctor.consultationMode}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {overallSentiment !== "Unknown" && overallSentiment !== "Neutral" && (
            <Badge variant={sentimentVariant}>
              {overallSentiment === "Positive" ? "Positive" : overallSentiment === "Negative" ? "Negative" : "Mixed"}
            </Badge>
          )}
          {doctor.prescribesStimulants === "Yes" && <Badge variant="purple"><CheckIcon />Stimulants</Badge>}
          {doctor.prescribesStimulants === "In-person only" && <Badge variant="purple"><CheckIcon />Stimulants (In-person)</Badge>}
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

          {(() => {
            const bestPhone = doctor.contact ? extractBestPhone(doctor.contact) : null;
            return bestPhone ? (
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Contact</p>
                <a
                  href={`tel:+91${bestPhone}`}
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium py-2 px-3 bg-accent/10 rounded-full transition-colors"
                >
                  <PhoneIcon />
                  {formatPhoneNumber(bestPhone)}
                </a>
              </div>
            ) : null;
          })()}

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
                    {review.sentiment !== "Neutral" && (
                      <span className={`text-xs font-semibold ${getSentimentColor(review.sentiment)}`}>
                        {review.sentiment}
                      </span>
                    )}
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        </div>
      )}
    </div>
  );
}

// --- Community Links ---

function CommunityLinks({ onSubmitDoctor }: { onSubmitDoctor: () => void }) {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <a
        href="https://discord.gg/adhdindia"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <DiscordIcon />
        Discord
      </a>
      <span className="text-border">|</span>
      <a
        href="https://www.reddit.com/r/adhdindia/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <RedditIcon />
        Reddit
      </a>
      <span className="text-border">|</span>
      <a
        href="https://forms.gle/b1VCBMtnddWUMFM87"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <ExternalLinkIcon />
        Contribute
      </a>
      <span className="text-border">|</span>
      <button
        onClick={onSubmitDoctor}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <ExternalLinkIcon />
        Submit a Doctor
      </button>
    </div>
  );
}

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
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40 backdrop-blur-[4px]"
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
                      <label className="text-sm font-medium text-foreground block mb-1">Fee (&#8377;)</label>
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

// --- Main Page ---

export default function Home() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [wizardStep, setWizardStep] = useState<"welcome" | "location" | "preferences" | "results">("welcome");
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [stimulants, setStimulants] = useState<string | null>(null);
  const [adultADHD, setAdultADHD] = useState(false);
  const [acceptsPrior, setAcceptsPrior] = useState(false);
  const [doesDiagnosis, setDoesDiagnosis] = useState(false);
  const [sort, setSort] = useState<SortValue>("rating-desc");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrefs, setSelectedPrefs] = useState<Set<PreferenceKey>>(new Set());
  const [doctorType, setDoctorType] = useState<string | null>(null);
  const [feeMin, setFeeMin] = useState(0);
  const [feeMax, setFeeMax] = useState(3000);
  const FEE_FLOOR = 0;
  const FEE_CEIL = 3000;
  const FEE_STEP = 500;
  const [drawerContext, setDrawerContext] = useState<DrawerContext | null>(null);
  const filterDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user has completed wizard before
    const wizardDone = localStorage.getItem("wizardComplete");
    const savedCity = localStorage.getItem("selectedCity");

    if (wizardDone) {
      // Returning user - go straight to results
      if (savedCity && savedCity !== "all") {
        setCity(savedCity);
      }
      setWizardStep("results");
    }

    setInitialized(true);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function handleGetStarted() {
    setWizardStep("location");
  }

  const handleCitySelect = useCallback((selectedCity: string) => {
    setCity(selectedCity);
    localStorage.setItem("selectedCity", selectedCity);
    setWizardStep("preferences");
  }, []);

  const handleCitySkip = useCallback(() => {
    setCity(null);
    localStorage.setItem("selectedCity", "all");
    setWizardStep("preferences");
  }, []);

  function handleLocationBack() {
    setWizardStep("welcome");
  }

  function handleTogglePref(key: PreferenceKey) {
    setSelectedPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handlePreferencesBack() {
    setWizardStep("location");
  }

  function handlePreferencesNext() {
    // Apply selected preferences as filters
    if (selectedPrefs.has("psychiatrist") && !selectedPrefs.has("psychologist")) {
      setDoctorType("Psychiatrist");
    } else if (selectedPrefs.has("psychologist") && !selectedPrefs.has("psychiatrist")) {
      setDoctorType("Psychologist");
    } else {
      setDoctorType(null);
    }

    if (selectedPrefs.has("online") && !selectedPrefs.has("inPerson")) {
      setMode("Online");
    } else if (selectedPrefs.has("inPerson") && !selectedPrefs.has("online")) {
      setMode("Offline");
    } else {
      setMode(null);
    }

    setStimulants(selectedPrefs.has("stimulants") ? "Yes" : null);
    setAdultADHD(selectedPrefs.has("adultADHD"));
    setAcceptsPrior(selectedPrefs.has("acceptsPrior"));
    setDoesDiagnosis(selectedPrefs.has("doesDiagnosis"));

    localStorage.setItem("wizardComplete", "true");
    setWizardStep("results");
  }

  const filtered = useMemo(() => {
    let result = [...doctors];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          (d.address && d.address.toLowerCase().includes(q)) ||
          d.type.toLowerCase().includes(q)
      );
    }

    if (city) result = result.filter((d) => d.city === city);
    if (doctorType) result = result.filter((d) => d.type === doctorType);
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
    if (feeMin > FEE_FLOOR || feeMax < FEE_CEIL) {
      result = result.filter((d) => {
        if (d.fee === null) return feeMax === FEE_CEIL;
        return d.fee >= feeMin && (feeMax === FEE_CEIL ? true : d.fee <= feeMax);
      });
    }

    result.sort((a, b) => {
      switch (sort) {
        case "name": {
          const nameA = a.name.replace(/^Dr\.?\s*/i, "");
          const nameB = b.name.replace(/^Dr\.?\s*/i, "");
          return nameA.localeCompare(nameB);
        }
        case "fee-asc":
          return (a.fee ?? Infinity) - (b.fee ?? Infinity);
        case "fee-desc":
          return (b.fee ?? 0) - (a.fee ?? 0);
        case "rating-desc": {
          const scoreA = a.reviews.filter((r) => r.sentiment === "Positive").length / (a.reviews.length || 1);
          const scoreB = b.reviews.filter((r) => r.sentiment === "Positive").length / (b.reviews.length || 1);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.reviews.length - a.reviews.length;
        }
        case "rating-asc": {
          const sA = a.reviews.filter((r) => r.sentiment === "Positive").length / (a.reviews.length || 1);
          const sB = b.reviews.filter((r) => r.sentiment === "Positive").length / (b.reviews.length || 1);
          if (sA !== sB) return sA - sB;
          return a.reviews.length - b.reviews.length;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [search, city, doctorType, mode, stimulants, adultADHD, acceptsPrior, doesDiagnosis, feeMin, feeMax, sort]);

  const activeFilterCount =
    (doctorType ? 1 : 0) + (mode ? 1 : 0) + (stimulants ? 1 : 0) +
    (adultADHD ? 1 : 0) + (acceptsPrior ? 1 : 0) + (doesDiagnosis ? 1 : 0) +
    (feeMin > FEE_FLOOR || feeMax < FEE_CEIL ? 1 : 0);

  function clearFilters() {
    setDoctorType(null);
    setMode(null);
    setStimulants(null);
    setAdultADHD(false);
    setAcceptsPrior(false);
    setDoesDiagnosis(false);
    setFeeMin(FEE_FLOOR);
    setFeeMax(FEE_CEIL);
    setSearch("");
  }

  function changeCity() {
    localStorage.removeItem("selectedCity");
    localStorage.removeItem("wizardComplete");
    setWizardStep("location");
  }

  function resetWizard() {
    localStorage.removeItem("selectedCity");
    localStorage.removeItem("wizardComplete");
    setCity(null);
    setSelectedPrefs(new Set());
    clearFilters();
    setWizardStep("welcome");
  }

  if (!initialized) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4 z-50">
        <SpinningLogo size={64} initialVelocity={600} />
      </div>
    );
  }

  // --- Wizard Steps ---

  if (wizardStep === "welcome") {
    return <WelcomeStep onGetStarted={handleGetStarted} />;
  }

  if (wizardStep === "location") {
    return (
      <LocationStep
        onSelect={handleCitySelect}
        onSkip={handleCitySkip}
        onBack={handleLocationBack}
      />
    );
  }

  if (wizardStep === "preferences") {
    return (
      <PreferencesStep
        selectedPrefs={selectedPrefs}
        onToggle={handleTogglePref}
        onBack={handlePreferencesBack}
        onNext={handlePreferencesNext}
      />
    );
  }

  // --- Step 3: Results ---

  return (
    <div className="min-h-screen-safe bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SpinningLogo size={28} />
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                ADHD Indian
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={changeCity}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 hover:bg-accent/20 transition-colors text-sm"
              >
                <span className="text-accent"><MapPinIcon /></span>
                <span className="text-accent font-semibold">{city || "All cities"}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent/60"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-surface hover:bg-surface-hover transition-colors text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Toggle theme"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search doctors, cities, hospitals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-full text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Filter + Sort row */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => {
                const next = !showFilters;
                setShowFilters(next);
                if (next) {
                  setTimeout(() => filterDrawerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:bg-surface-hover"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
              </svg>
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSort(!showSort)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  showSort ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-hover"
                }`}
              >
                {sort === "name" ? (
                  <ArrowUpAZ size={14} />
                ) : sort === "rating-desc" || sort === "fee-desc" ? (
                  <ArrowDownNarrowWide size={14} />
                ) : (
                  <ArrowUpNarrowWide size={14} />
                )}
                {sortOptions.find((o) => o.value === sort)?.label ?? "Sort"}
              </button>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] bg-surface border border-border rounded-xl shadow-lg overflow-hidden py-1">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSort(opt.value); setShowSort(false); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors ${
                          sort === opt.value
                            ? "bg-accent/10 text-accent font-semibold"
                            : "text-foreground hover:bg-surface-hover"
                        }`}
                      >
                        {opt.value === "name" ? (
                          <ArrowUpAZ size={15} className="shrink-0" />
                        ) : opt.value === "rating-desc" || opt.value === "fee-desc" ? (
                          <ArrowDownNarrowWide size={15} className="shrink-0" />
                        ) : (
                          <ArrowUpNarrowWide size={15} className="shrink-0" />
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <div ref={filterDrawerRef} className="grid transition-[grid-template-rows] duration-200 ease-out" style={{ gridTemplateRows: showFilters ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="bg-surface border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
            {/* Doctor Type */}
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Doctor Type</p>
              <SegmentedControl>
                <SegmentChip label="Any" active={doctorType === null} onClick={() => setDoctorType(null)} />
                <SegmentChip label="Psychiatrist" active={doctorType === "Psychiatrist"} onClick={() => setDoctorType(doctorType === "Psychiatrist" ? null : "Psychiatrist")} />
                <SegmentChip label="Psychologist" active={doctorType === "Psychologist"} onClick={() => setDoctorType(doctorType === "Psychologist" ? null : "Psychologist")} />
              </SegmentedControl>
            </div>

            {/* Consultation Mode */}
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Consultation Mode</p>
              <SegmentedControl>
                <SegmentChip label="Any" active={mode === null} onClick={() => setMode(null)} />
                {consultationModes.map((m) => (
                  <SegmentChip key={m} label={m} active={mode === m} onClick={() => setMode(mode === m ? null : m)} />
                ))}
              </SegmentedControl>
            </div>

            {/* Stimulants */}
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Prescribes Stimulants</p>
              <SegmentedControl>
                <SegmentChip label="Any" active={stimulants === null} onClick={() => setStimulants(null)} />
                {stimulantOptions.map((s) => (
                  <SegmentChip key={s} label={s} active={stimulants === s} onClick={() => setStimulants(stimulants === s ? null : s)} />
                ))}
              </SegmentedControl>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Consultation Fee</p>
                {(feeMin > FEE_FLOOR || feeMax < FEE_CEIL) && (
                  <button
                    onClick={() => { setFeeMin(FEE_FLOOR); setFeeMax(FEE_CEIL); }}
                    className="ml-auto text-muted hover:text-foreground transition-colors"
                    aria-label="Reset fee range"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 1 3 6.7" /><path d="M3 22v-6h6" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground tabular-nums shrink-0 w-10 text-center">₹{feeMin.toLocaleString("en-IN")}</span>
                <div
                  className="relative flex-1 h-9 flex items-center border border-border rounded-full bg-background p-1 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const raw = pct * FEE_CEIL;
                    const snapped = Math.round(raw / FEE_STEP) * FEE_STEP;
                    const distToMin = Math.abs(snapped - feeMin);
                    const distToMax = Math.abs(snapped - feeMax);
                    if (distToMin <= distToMax) {
                      setFeeMin(Math.min(snapped, feeMax - FEE_STEP));
                    } else {
                      setFeeMax(Math.max(snapped, feeMin + FEE_STEP));
                    }
                  }}
                >
                  {/* Track background */}
                  <div className="absolute left-1 right-1 h-full rounded-full bg-background" />
                  {/* Active range fill */}
                  <div
                    className="absolute top-1 bottom-1 rounded-full bg-accent/30 dark:bg-accent/25"
                    style={{
                      left: `calc(${(feeMin / FEE_CEIL) * 100}% + 4px)`,
                      right: `calc(${100 - (feeMax / FEE_CEIL) * 100}% + 4px)`,
                    }}
                  />
                  {/* Min thumb */}
                  <input
                    type="range"
                    min={FEE_FLOOR}
                    max={FEE_CEIL}
                    step={FEE_STEP}
                    value={feeMin}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value), feeMax - FEE_STEP);
                      setFeeMin(v);
                    }}
                    className="absolute left-0 right-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-background [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-background"
                    style={{ zIndex: feeMin > FEE_CEIL - FEE_STEP ? 5 : 3 }}
                  />
                  {/* Max thumb */}
                  <input
                    type="range"
                    min={FEE_FLOOR}
                    max={FEE_CEIL}
                    step={FEE_STEP}
                    value={feeMax}
                    onChange={(e) => {
                      const v = Math.max(Number(e.target.value), feeMin + FEE_STEP);
                      setFeeMax(v);
                    }}
                    className="absolute left-0 right-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-background [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-background"
                    style={{ zIndex: 4 }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums shrink-0 w-14 text-center">{feeMax === FEE_CEIL ? "₹3K+" : `₹${feeMax >= 1000 ? `${(feeMax / 1000).toFixed(1).replace(".0", "")}K` : feeMax.toLocaleString("en-IN")}`}</span>
              </div>
            </div>

            {/* Toggle filters */}
            <div className="flex flex-wrap gap-1.5">
              <FilterChip label="Adult ADHD Specialist" active={adultADHD} onClick={() => setAdultADHD(!adultADHD)} />
              <FilterChip label="Accepts Prior Diagnosis" active={acceptsPrior} onClick={() => setAcceptsPrior(!acceptsPrior)} />
              <FilterChip label="Does ADHD Testing" active={doesDiagnosis} onClick={() => setDoesDiagnosis(!doesDiagnosis)} />
            </div>

            <div className="flex items-center justify-between">
              {activeFilterCount > 0 ? (
                <button onClick={clearFilters} className="text-sm text-accent hover:text-accent-hover font-medium">
                  Clear all filters
                </button>
              ) : <span />}
              <button onClick={() => setShowFilters(false)} className="text-sm font-medium px-4 py-1.5 rounded-full bg-accent text-white hover:bg-accent-hover">
                Done
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted">
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
            {city ? ` in ${city}` : ""}
          </p>
          <button
            onClick={() => setDrawerContext({ type: "new-doctor" })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Doctor
          </button>
        </div>

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
            ))}
          </div>
        )}

        <footer className="mt-12 pb-8 space-y-4">
          <CommunityLinks onSubmitDoctor={() => setDrawerContext({ type: "new-doctor" })} />
          <div className="text-center space-y-2">
            <p className="text-xs text-muted">
              Data sourced from community contributions.
            </p>
            <p className="text-xs text-muted">
              Built by{" "}
              <a
                href="https://rahulmax.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover underline underline-offset-2"
              >
                rahulmax
              </a>
            </p>
            <button
              onClick={resetWizard}
              className="text-xs text-muted hover:text-accent underline underline-offset-2"
            >
              Restart setup wizard
            </button>
          </div>
        </footer>
      </main>

      {drawerContext && (
        <SubmissionDrawer
          context={drawerContext}
          onClose={() => setDrawerContext(null)}
        />
      )}
    </div>
  );
}
