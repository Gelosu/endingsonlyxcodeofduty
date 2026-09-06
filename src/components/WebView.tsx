"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import MemoryCard from "./MemoryCard";
import { groupImages } from "@/lib/memories";

// A tiny deterministic hash so each photo gets the same "random" spot
// every time (stable across re-renders/resizes) — no seed to thread
// through, and two photos never collide on the same hash input.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

// About how big a card actually renders at, in px, matching the `size_`
// tailwind classes below — used only to keep cells big enough that two
// photos' jitter can't push them into each other.
function approxCardPx(containerWidth: number, count: number): number {
  const big = count <= 30;
  if (containerWidth >= 768) return big ? 112 : 96; // md
  if (containerWidth >= 640) return big ? 96 : 80; // sm
  return big ? 64 : 56;
}

// Scatters every photo across the container, each in its own patch of
// space, instead of packing them into a ring around the hub. On a narrow
// phone screen the whole arrangement is masked to a circle (still built
// out of square cards) so it reads as a round web; on anything wider it
// fills the full rectangle. Lays an invisible grid, shuffles which cell
// each photo lands in (seeded off the image list, so it's stable across
// re-renders), then jitters each photo inside its cell — capped so the
// jitter itself can never push a card into its neighbor's space.
function scatterPositions(
  images: string[],
  width: number,
  height: number,
  marginX: number,
  marginTop: number,
  marginBottom: number,
  cardPx: number
) {
  const total = images.length;
  const positions = new Map<string, { x: number; y: number }>();
  if (total === 0 || width === 0 || height === 0) return positions;

  const usableW = Math.max(1, width - marginX * 2);
  const usableH = Math.max(1, height - marginTop - marginBottom);

  const circular = width < 640;
  const side = Math.min(usableW, usableH);
  const boxW = circular ? side : usableW;
  const boxH = circular ? side : usableH;
  const boxX = marginX + (usableW - boxW) / 2;
  const boxY = marginTop + (usableH - boxH) / 2;
  const cx = boxX + boxW / 2;
  const cy = boxY + boxH / 2;
  const radius = Math.min(boxW, boxH) / 2;

  // grow the grid until enough cells actually fall inside the allowed
  // shape (the circle on mobile, the whole box otherwise) to give every
  // photo a cell roughly as big as the card itself
  let cols = Math.max(1, Math.round(Math.sqrt(total * (boxW / boxH))));
  let rows = Math.max(1, Math.ceil(total / cols));
  let cellW = boxW / cols;
  let cellH = boxH / rows;
  let cells: number[] = [];

  for (let guard = 0; guard < 12; guard++) {
    cellW = boxW / cols;
    cellH = boxH / rows;
    cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = boxX + cellW * (c + 0.5);
        const py = boxY + cellH * (r + 0.5);
        const fits = !circular || Math.hypot(px - cx, py - cy) <= radius - Math.max(cellW, cellH) * 0.15;
        if (fits) cells.push(r * cols + c);
      }
    }
    if (cells.length >= total && cellW >= cardPx * 1.1 && cellH >= cardPx * 1.1) break;
    if (cells.length < total) {
      cols += 1;
      rows = Math.max(rows, Math.ceil(total / cols) + (circular ? 1 : 0));
    } else {
      break; // enough room; further growth would only shrink cells more
    }
  }

  // seeded shuffle of cell order, so the same set of photos always maps
  // to roughly the same layout rather than reshuffling every render
  let seed = Math.floor(images.reduce((acc, name) => acc + hash(name) * 7919, 1)) % 2147483647 || 1;
  const rand = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  const order = [...cells];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  images.forEach((name, i) => {
    const cell = order[i % order.length];
    const col = cell % cols;
    const row = Math.floor(cell / cols);
    // jitter, but never far enough to close the gap the card itself needs
    const maxJitterX = Math.max(0, (cellW - cardPx) / 2) * 0.85;
    const maxJitterY = Math.max(0, (cellH - cardPx) / 2) * 0.85;
    const jitterX = (hash(`${name}:x`) - 0.5) * 2 * maxJitterX;
    const jitterY = (hash(`${name}:y`) - 0.5) * 2 * maxJitterY;
    positions.set(name, {
      x: boxX + cellW * (col + 0.5) + jitterX,
      y: boxY + cellH * (row + 0.5) + jitterY,
    });
  });
  return positions;
}

// The literal spiderweb: a few concentric guide rings, plus one real
// strand running from the hub out to *every* photo's actual position —
// each image hangs off its own thread, not a generic evenly-spaced spoke.
function WebStrands({
  width,
  height,
  ringCount,
  points,
}: {
  width: number;
  height: number;
  ringCount: number;
  points: { x: number; y: number }[];
}) {
  if (!width || !height) return null;
  const cx = width / 2;
  const cy = height * 0.46;
  const scale = Math.min(width, height);

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

      {points.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="url(#webGradient)"
          strokeWidth={1}
          opacity={0.35}
        />
      ))}
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
    images.length <= 30
      ? "h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28"
      : "h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24";

  const positionMap = useMemo(
    () =>
      scatterPositions(
        images,
        size.width,
        size.height,
        56,
        24,
        56,
        approxCardPx(size.width, images.length)
      ),
    [images, size.width, size.height]
  );
  const positions = useMemo(
    () =>
      images
        .map((name) => ({ name, pos: positionMap.get(name) }))
        .filter((p): p is { name: string; pos: { x: number; y: number } } => !!p.pos),
    [images, positionMap]
  );

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
        <WebStrands
          width={size.width}
          height={size.height}
          ringCount={4}
          points={positions.map((p) => p.pos)}
        />

        {/* the hub */}
        {size.width > 0 && (
          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-gold-bright bg-gold shadow-[0_0_18px_rgba(255,94,120,0.9)]"
            style={{ left: size.width / 2, top: size.height * 0.46 }}
          />
        )}

        {size.width > 0 &&
          positions.map(({ name, pos }) => {
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
