"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import CornerFrame from "./CornerFrame";

export default function MemoryCard({
  src,
  onOpen,
  tilt = 0,
  sizeClass = "h-40 w-40 sm:h-52 sm:w-52 md:h-60 md:w-60",
}: {
  src: string;
  onOpen: () => void;
  tilt?: number;
  sizeClass?: string;
}) {
  const [glitching, setGlitching] = useState(false);
  const glitchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHoverEnd = () => {
    setGlitching(true);
    if (glitchTimeout.current) clearTimeout(glitchTimeout.current);
    glitchTimeout.current = setTimeout(() => setGlitching(false), 500);
  };

  useEffect(() => {
    return () => {
      if (glitchTimeout.current) clearTimeout(glitchTimeout.current);
    };
  }, []);

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className={`relative block shrink-0 select-none ${sizeClass}`}
      style={{ rotate: tilt }}
      onHoverStart={() => {
        if (glitchTimeout.current) clearTimeout(glitchTimeout.current);
        setGlitching(false);
      }}
      onHoverEnd={handleHoverEnd}
      whileHover={{
        scale: 1.18,
        rotate: 0,
        zIndex: 20,
        transition: { type: "spring", stiffness: 300, damping: 15 },
      }}
      whileTap={{ scale: 1.06 }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative h-full w-full leaf-glow transition-shadow duration-300">
        <div
          className={`relative h-full w-full overflow-hidden rounded-sm border border-gold/70 bg-ink ${
            glitching ? "leaf-glitching" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/uploads/${src}`}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/40" />
        </div>
        <CornerFrame />
      </div>
    </motion.button>
  );
}
