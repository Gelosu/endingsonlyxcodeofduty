"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import CornerFrame from "./CornerFrame";

type Comment = { id: string; text: string; name: string; createdAt: string };
type Entry = { hearts: number; comments: Comment[] };
type ReactionsMap = Record<string, Entry>;

const HEARTED_KEY = "endings-only-hearted";
const NAME_KEY = "endings-only-name";

function readHearted(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(HEARTED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export default function MemoryModal({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}) {
  const [reactions, setReactions] = useState<ReactionsMap>({});
  const [hearted, setHearted] = useState<Set<string>>(new Set());
  const [heartPop, setHeartPop] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const src = index !== null ? images[index] : null;

  useEffect(() => {
    fetch("/api/reactions")
      .then((r) => r.json())
      .then(setReactions)
      .catch(() => {});
    setHearted(readHearted());
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {}
  }, []);

  useEffect(() => {
    setCommentsOpen(false);
    setDraft("");
  }, [src]);

  useEffect(() => {
    if (index === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, onClose, onNavigate]);

  const entry = src ? reactions[src] ?? { hearts: 0, comments: [] } : { hearts: 0, comments: [] };
  const isHearted = src ? hearted.has(src) : false;

  const sendHeart = async () => {
    if (!src || isHearted) return;
    const next = new Set(hearted).add(src);
    setHearted(next);
    localStorage.setItem(HEARTED_KEY, JSON.stringify([...next]));
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 400);
    setReactions((prev) => ({ ...prev, [src]: { ...entry, hearts: entry.hearts + 1 } }));
    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: src, action: "heart" }),
      });
    } catch {}
  };

  const sendComment = async () => {
    const text = draft.trim();
    if (!src || !text || submitting) return;
    setSubmitting(true);
    try {
      localStorage.setItem(NAME_KEY, name);
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: src, action: "comment", text, name }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReactions((prev) => ({ ...prev, [src]: { hearts: updated.hearts, comments: updated.comments } }));
        setDraft("");
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-[var(--ink)]/92 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* prev / next */}
          {images.length > 1 && (
            <>
              <button
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(-1);
                }}
                className="touch-manipulation group absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border-2 border-teal/60 bg-black/40 p-2 sm:left-6 sm:p-3 transition-colors hover:border-gold-bright hover:bg-black/70"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-teal group-hover:stroke-gold-bright">
                  <path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(1);
                }}
                className="touch-manipulation group absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border-2 border-teal/60 bg-black/40 p-2 sm:right-6 sm:p-3 transition-colors hover:border-gold-bright hover:bg-black/70"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-teal group-hover:stroke-gold-bright">
                  <path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <button
            aria-label="Close"
            onClick={onClose}
            className="touch-manipulation absolute right-2 top-2 z-10 rounded-full border-2 border-gold-bright/70 bg-black/40 p-2 text-gold-bright transition-colors hover:bg-black/70 sm:right-6 sm:top-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 6l12 12M18 6L6 18" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* the framed image + reactions */}
          <motion.div
            key={src}
            className="relative flex max-h-full w-full max-w-2xl flex-col items-center gap-3"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-xl border-[3px] border-foreground/80 leaf-glow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/uploads/${src}`}
                alt=""
                className="max-h-[52vh] max-w-[92vw] object-contain sm:max-h-[64vh] sm:max-w-[88vw]"
              />
              <CornerFrame />
            </div>

            {/* reactions bar */}
            <div className="flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-teal/30 bg-black/40 px-3 py-2 sm:gap-3 sm:px-4">
              <button
                onClick={sendHeart}
                disabled={isHearted}
                aria-label="Heart this photo"
                className={`touch-manipulation flex items-center gap-1.5 text-sm transition-colors ${
                  isHearted ? "text-gold-bright" : "text-foreground/70 hover:text-gold-bright"
                }`}
              >
                <motion.span animate={heartPop ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.4 }}>
                  {isHearted ? "❤️" : "🤍"}
                </motion.span>
                {entry.hearts}
              </button>

              <span className="h-4 w-px bg-white/15" />

              <button
                onClick={() => setCommentsOpen((v) => !v)}
                className={`touch-manipulation flex items-center gap-1.5 text-sm transition-colors ${
                  commentsOpen ? "text-teal" : "text-foreground/70 hover:text-teal"
                }`}
              >
                💬 {entry.comments.length}
              </button>

              {images.length > 1 && (
                <>
                  <span className="h-4 w-px bg-white/15" />
                  <span className="text-[10px] uppercase tracking-widest text-foreground/40">
                    {index !== null ? index + 1 : 0} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* comments panel */}
            <AnimatePresence>
              {commentsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full max-w-md overflow-hidden rounded-lg border border-teal/25 bg-black/50"
                >
                  <div className="max-h-28 space-y-2 overflow-y-auto px-3 py-2 sm:max-h-36">
                    {entry.comments.length === 0 ? (
                      <p className="py-1 text-center text-xs text-foreground/40">
                        No comments yet — be the first.
                      </p>
                    ) : (
                      entry.comments.map((c) => (
                        <div key={c.id} className="text-xs">
                          <span className="font-heading text-gold-bright">{c.name}</span>{" "}
                          <span className="text-foreground/80">{c.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendComment();
                    }}
                    className="flex items-center gap-2 border-t border-white/10 px-3 py-2"
                  >
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="name"
                      maxLength={40}
                      className="w-14 shrink-0 bg-transparent text-[16px] text-foreground/70 placeholder:text-foreground/30 focus:outline-none sm:w-16 sm:text-xs"
                    />
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="say something..."
                      maxLength={500}
                      className="min-w-0 flex-1 bg-transparent text-[16px] text-foreground focus:outline-none sm:text-xs"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim() || submitting}
                      className="touch-manipulation shrink-0 text-xs text-teal disabled:opacity-30"
                    >
                      send
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
