"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import WebView from "./WebView";
import CornerFrame from "./CornerFrame";
import type { Letter } from "@/lib/letters";

// slow, steady read-along scroll once the letter is open — pixels per second
const AUTO_SCROLL_SPEED = 16;

export default function LetterView({ letter }: { letter?: Letter }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"closed" | "bursting" | "open">("closed");
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  const body = letter?.body ?? "";

  const openEnvelope = () => {
    if (phase !== "closed") return;
    setPhase("bursting");
  };

  // the burst is a fixed-length one-shot animation; hand off to the open
  // letter once it plays out
  useEffect(() => {
    if (phase !== "bursting") return;
    const t = setTimeout(() => setPhase("open"), 460);
    return () => clearTimeout(t);
  }, [phase]);

  // gentle continuous auto-scroll while reading, unless the reader takes over
  useEffect(() => {
    if (phase !== "open") return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!userScrolledRef.current) {
        const max = el.scrollHeight - el.clientHeight;
        if (max > 0 && el.scrollTop < max) {
          el.scrollTop = Math.min(max, el.scrollTop + AUTO_SCROLL_SPEED * dt);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const goBack = () => router.push("/");

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* the web, still there, just dimmed behind the letter — no photos,
          so this page loads fast (the strands/hub render is enough to
          read as "the same web" without fetching every image). Kept
          bright enough that the backdrop reads as the web, not a plain
          black screen, once the photos are gone. */}
      <div className="pointer-events-none absolute inset-0 opacity-60 grayscale-[0.15]">
        <WebView images={[]} onSelect={() => {}} />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 46%, rgba(45,212,255,0.12), transparent 65%), rgba(6,6,8,0.55)",
        }}
      />

      <button
        onClick={goBack}
        aria-label="Back to the web"
        className="touch-manipulation absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border-2 border-teal/60 bg-black/50 px-3 py-2 text-xs uppercase tracking-widest text-teal transition-colors hover:border-gold-bright hover:text-gold-bright sm:left-6 sm:top-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        back to the web
      </button>

      <div className="relative z-10 flex h-full items-center justify-center p-4 sm:p-8">
        {!letter ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 19 }}
            className="letter-frame relative flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border-[3px] border-foreground/80 bg-[var(--panel)] px-6 py-8 text-center shadow-[0_0_44px_rgba(255,42,68,0.16)]"
          >
            <CornerFrame />
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-gold-bright text-glow-gold">
              no letter here yet
            </p>
            <p className="text-sm text-foreground/60">This name doesn&apos;t have a letter written for it.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {phase !== "open" ? (
              <motion.button
                key="envelope"
                onClick={openEnvelope}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 19 }}
                className={`letter-frame group relative flex w-full max-w-xs flex-col items-center gap-5 rounded-lg border-[3px] border-foreground/80 bg-[var(--panel)] px-6 py-10 shadow-[0_0_44px_rgba(24,232,255,0.16)] focus:outline-none ${
                  phase === "bursting" ? "envelope-burst" : ""
                }`}
              >
                <CornerFrame />
                <div className="relative h-28 w-full overflow-hidden rounded border border-teal/40 bg-black/40 sm:h-32">
                  <div className="envelope-flap" />
                  <div className="absolute left-1/2 top-[62%] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-gold-bright bg-gold shadow-[0_0_16px_rgba(255,94,120,0.85)]" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <h1 className="font-heading text-xs uppercase tracking-[0.35em] text-teal text-glow-teal sm:text-sm">
                    For {letter.name}
                  </h1>
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 transition-colors group-hover:text-gold-bright">
                    tap to open
                  </p>
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="letter"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 19, delay: 0.12 }}
                className="letter-frame relative flex max-h-[86dvh] w-full max-w-lg flex-col overflow-hidden rounded-lg border-[3px] border-foreground/80 bg-[var(--panel)] shadow-[0_0_44px_rgba(24,232,255,0.16)]"
              >
                <CornerFrame />

                <div className="shrink-0 border-b border-teal/20 px-5 py-3 text-center">
                  <h1 className="font-heading text-xs uppercase tracking-[0.35em] text-teal text-glow-teal sm:text-sm">
                    For {letter.name}
                  </h1>
                </div>

                <div
                  ref={scrollRef}
                  onWheel={() => (userScrolledRef.current = true)}
                  onTouchMove={() => (userScrolledRef.current = true)}
                  className="no-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7"
                >
                  <p className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-foreground/90 sm:text-base">
                    {body}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
