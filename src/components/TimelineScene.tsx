"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MemoryCard from "./MemoryCard";
import MemoryModal from "./MemoryModal";
import { groupImages, quoteFor } from "@/lib/memories";

// Card size shrinks with how many photos are in the memory, so a whole
// memory reads as one row — never stacked onto a second line.
function sizeClassFor(count: number) {
  if (count <= 3) return "h-56 w-56 sm:h-80 sm:w-80 md:h-96 md:w-96 lg:h-[26rem] lg:w-[26rem]";
  if (count <= 5) return "h-44 w-44 sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80 xl:h-96 xl:w-96";
  return "h-32 w-32 sm:h-48 sm:w-48 md:h-60 md:w-60 lg:h-72 lg:w-72 xl:h-80 xl:w-80";
}

export default function TimelineScene({
  images,
  jumpToGroupId,
  onBack,
}: {
  images: string[];
  jumpToGroupId?: string | null;
  onBack?: () => void;
}) {
  const loaded = images.length > 0;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => groupImages(images), [images]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const openAt = (name: string) => setActiveIndex(flat.indexOf(name));
  const close = () => setActiveIndex(null);
  const navigate = (delta: number) =>
    setActiveIndex((i) => {
      if (i === null) return i;
      return (i + delta + flat.length) % flat.length;
    });

  const goToSlide = (i: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[i] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior, inline: "center", block: "nearest" });
  };

  // jump straight to the requested memory once the groups are ready
  useEffect(() => {
    if (!jumpToGroupId || groups.length === 0) return;
    const i = groups.findIndex((g) => g.id === jumpToGroupId);
    if (i >= 0) {
      // no smooth-scroll animation on first landing — snap straight there
      requestAnimationFrame(() => goToSlide(i, "auto"));
      setSlide(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToGroupId, groups.length]);

  // let a plain vertical mouse-wheel drive the horizontal swipe too, so
  // desktop trackpads/scroll-wheels pan left/right instead of doing nothing
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [groups.length]);

  // track which slide is centered, for the dot indicator
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const width = track.clientWidth || 1;
      setSlide(Math.round(track.scrollLeft / width));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [groups.length]);

  // arrow keys move between memories when the modal isn't open
  useEffect(() => {
    if (activeIndex !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToSlide(Math.min(slide + 1, groups.length - 1));
      if (e.key === "ArrowLeft") goToSlide(Math.max(slide - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slide, groups.length, activeIndex]);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      {/* header */}
      <header className="relative z-20 border-b border-gold/15 bg-[var(--background)]/85 px-3 py-3 backdrop-blur-sm sm:px-8 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back to the web"
                className="touch-manipulation shrink-0 rounded-full border border-teal/50 p-2 text-teal transition-colors hover:border-gold-bright hover:text-gold-bright"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <div className="min-w-0">
              <h1 className="truncate font-title text-sm text-gold-bright text-glow-gold sm:text-2xl">
                Endings Only <span className="text-teal text-glow-teal">x</span> Code of Duty
              </h1>
              <p className="truncate text-[9px] uppercase tracking-[0.2em] text-foreground/40 sm:text-xs sm:tracking-[0.3em]">
                {images.length} memories · swipe to browse
              </p>
            </div>
          </div>
          <span className="hidden h-2.5 w-2.5 shrink-0 rotate-45 border border-gold-bright bg-gold/30 sm:block" />
        </div>
        <div className="gold-rule mt-2 sm:mt-3" />
      </header>

      {/* ambient glow field */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 15% 10%, rgba(45,212,255,0.10), transparent 60%), radial-gradient(ellipse 60% 40% at 85% 90%, rgba(255,42,68,0.14), transparent 60%)",
        }}
      />

      {loaded && images.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-foreground/50">
          <p className="font-heading text-lg text-teal text-glow-teal">No memories yet</p>
          <p className="max-w-sm text-sm">
            Drop your exported images into{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs">public/uploads</code> and
            refresh — they&apos;ll appear here automatically.
          </p>
        </div>
      )}

      {loaded && groups.length > 0 && (
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* left / right nav for mouse users */}
          {slide > 0 && (
            <button
              aria-label="Previous memory"
              onClick={() => goToSlide(slide - 1)}
              className="touch-manipulation group absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border-2 border-teal/50 bg-black/30 p-2 transition-colors hover:border-gold-bright sm:left-6"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-teal group-hover:stroke-gold-bright">
                <path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {slide < groups.length - 1 && (
            <button
              aria-label="Next memory"
              onClick={() => goToSlide(slide + 1)}
              className="touch-manipulation group absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border-2 border-teal/50 bg-black/30 p-2 transition-colors hover:border-gold-bright sm:right-6"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-teal group-hover:stroke-gold-bright">
                <path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* the horizontal, swipeable track */}
          <div
            ref={trackRef}
            className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth"
          >
            {groups.map((group, gi) => (
              <section
                key={group.id}
                className="flex w-full shrink-0 snap-center flex-col items-center justify-center gap-3 overflow-y-auto px-3 py-6 sm:gap-5 sm:px-14 sm:py-8"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="h-1.5 w-1.5 rotate-45 border border-gold-bright bg-gold shadow-[0_0_14px_rgba(255,94,120,0.8)] sm:h-2 sm:w-2" />
                  <h2 className="font-heading text-[10px] uppercase tracking-[0.3em] text-teal text-glow-teal sm:text-sm sm:tracking-[0.35em]">
                    {group.label}
                  </h2>
                </div>
                <p className="max-w-xs px-4 text-center font-heading text-xs italic text-foreground/60 sm:max-w-md sm:text-base">
                  &ldquo;{quoteFor(gi)}&rdquo;
                </p>
                <div className="no-scrollbar flex w-full flex-nowrap items-center justify-center gap-2 overflow-x-auto overscroll-x-contain px-2 sm:gap-4">
                  {group.items.map((name, i) => (
                    <MemoryCard
                      key={name}
                      src={name}
                      tilt={i % 3 === 0 ? -3 : i % 3 === 1 ? 3 : -1.5}
                      sizeClass={sizeClassFor(group.items.length)}
                      onOpen={() => openAt(name)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* dot indicator */}
          <div className="relative z-10 flex items-center justify-center gap-2 pb-5">
            {groups.map((group, i) => (
              <button
                key={group.id}
                aria-label={`Go to ${group.label}`}
                onClick={() => goToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? "w-6 bg-gold-bright" : "w-1.5 bg-foreground/25 hover:bg-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <MemoryModal images={flat} index={activeIndex} onClose={close} onNavigate={navigate} />
    </div>
  );
}
