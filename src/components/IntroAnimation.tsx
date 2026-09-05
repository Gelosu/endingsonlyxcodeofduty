"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const INTRO_DURATION_MS = 5200;

// quick strobing comic-panel flashes that punch in before the title settles
const FLASH_COLORS = ["#ff2a44", "#18e8ff", "#ff2a44", "#18e8ff"];

export default function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const [flashesDone, setFlashesDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFlashesDone(true), FLASH_COLORS.length * 140 + 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), INTRO_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
  }, [visible, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[var(--ink)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {/* strobing color panels — the "dimension breaking open" beat */}
          {!flashesDone &&
            FLASH_COLORS.map((color, i) => (
              <div
                key={i}
                className="strobe-flash pointer-events-none absolute inset-0"
                style={{ background: color, animationDelay: `${i * 0.14}s` }}
              />
            ))}

          {/* halftone burst + ambient glow */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(45,212,255,0.16), transparent 55%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.15 }}
            transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
          />

          {/* scanline sweep */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-teal/25 to-transparent"
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1.8, delay: 0.5, ease: "linear", repeat: 2, repeatDelay: 0.6 }}
          />

          <div className="relative flex flex-col items-center gap-4 px-8 text-center">
            <motion.p
              className="font-heading tracking-[0.5em] text-xs sm:text-sm text-teal text-glow-teal uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              across every universe
            </motion.p>

            <motion.h1
              data-text="Endings Only"
              className="glitch-text font-title text-4xl sm:text-6xl md:text-7xl text-gold-bright text-glow-gold"
              initial={{ opacity: 0, scale: 1.3, skewX: -6 }}
              animate={{ opacity: 1, scale: 1, skewX: 0 }}
              transition={{ duration: 0.45, delay: 0.75, ease: "easeOut" }}
            >
              Endings Only
            </motion.h1>

            <motion.p
              className="font-heading text-lg sm:text-2xl tracking-[0.35em] text-foreground/70 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.05 }}
            >
              x Code of Duty
            </motion.p>
          </div>

          {/* progress bar */}
          <div className="absolute bottom-14 h-[2px] w-56 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-teal via-gold to-gold-bright"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ transformOrigin: "left" }}
              transition={{ duration: INTRO_DURATION_MS / 1000, ease: "linear" }}
            />
          </div>

          <button
            onClick={() => setVisible(false)}
            className="absolute bottom-6 text-xs uppercase tracking-widest text-foreground/40 hover:text-teal transition-colors"
          >
            skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
