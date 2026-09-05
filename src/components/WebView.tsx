"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import MemoryCard from "./MemoryCard";
import { groupImages } from "@/lib/memories";

// Deterministic organic scatter (golden-angle spiral). Positions are
// computed in real pixels against the container's actual size, scaled by
// its *smaller* dimension — so the web reads as a circle on a wide desktop
// screen AND on a narrow, tall phone, instead of stretching into a smear.
function positionFor(index: number, total: number, width: number, height: number) {
  const goldenAngle = 137.508 * (Math.PI / 180);
  const angle = index * goldenAngle;
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const scale = Math.min(width, height);
  const radius = (0.12 + t * 0.42) * scale;
  const margin = 28;
  const x = width / 2 + Math.cos(angle) * radius;
  const y = height * 0.46 + Math.sin(angle) * radius;
  return {
    x: Math.min(width - margin, Math.max(margin, x)),
    y: Math.min(height - margin, Math.max(margin, y)),
  };
}

// A handful of concentric rings + radial spokes — a literal spiderweb —
// drawn once behind every node, in the same pixel space as the nodes.
function WebStrands({ width, height, ringCount }: { width: number; height: number; ringCount: number }) {
  if (!width || !height) return null;
  const cx = width / 2;
  const cy = height * 0.46;
  const scale = Math.min(width, height);
  const spokes = 14;
  const outerRadius = 0.56 * scale;

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="webGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18e8ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff2a44" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {Array.from({ length: ringCount }, (_, i) => (0.14 + (i * 0.42) / ringCount) * scale).map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="url(#webGradient)" strokeWidth={1} opacity={0.55} />
      ))}

      {Array.from({ length: spokes }, (_, s) => {
        const a = (s / spokes) * Math.PI * 2;
        return (
          <line
            key={s}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * outerRadius}
            y2={cy + Math.sin(a) * outerRadius}
            stroke="url(#webGradient)"
            strokeWidth={1}
            opacity={0.35}
          />
        );
      })}
    </svg>
  );
}

export default function WebView({
  images,
  onSelect,
}: {
  images: string[];
  onSelect: (groupId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const groups = useMemo(() => groupImages(images), [images]);
  const groupOf = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) for (const name of g.items) map.set(name, g.id);
    return map;
  }, [groups]);

  const size_ =
    images.length <= 30 ? "h-14 w-14 sm:h-20 sm:w-20" : "h-11 w-11 sm:h-14 sm:w-14";

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <header className="relative z-20 px-4 py-4 text-center sm:px-8 sm:py-5">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-title text-base text-gold-bright text-glow-gold leading-tight sm:text-2xl md:text-3xl"
        >
          Endings Only <span className="text-teal text-glow-teal">x</span> Code of Duty
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-1 px-2 text-[9px] uppercase tracking-[0.25em] text-foreground/40 sm:text-xs sm:tracking-[0.4em]"
        >
          every memory, one web — tap a photo to step inside
        </motion.p>
      </header>

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 46%, rgba(45,212,255,0.10), transparent 60%), radial-gradient(ellipse 60% 40% at 85% 90%, rgba(255,42,68,0.12), transparent 60%)",
        }}
      />

      <div ref={containerRef} className="relative flex-1 touch-manipulation">
        <WebStrands width={size.width} height={size.height} ringCount={4} />

        {/* the hub */}
        {size.width > 0 && (
          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-gold-bright bg-gold shadow-[0_0_18px_rgba(255,94,120,0.9)]"
            style={{ left: size.width / 2, top: size.height * 0.46 }}
          />
        )}

        {size.width > 0 &&
          images.map((name, i) => {
            const pos = positionFor(i, images.length, size.width, size.height);
            const groupId = groupOf.get(name);
            return (
              <div
                key={name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: pos.x, top: pos.y }}
              >
                <MemoryCard src={name} sizeClass={size_} onOpen={() => groupId && onSelect(groupId)} />
              </div>
            );
          })}
      </div>
    </div>
  );
}
