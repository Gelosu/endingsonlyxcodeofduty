"use client";

import { useEffect, useState } from "react";
import IntroAnimation from "@/components/IntroAnimation";
import WebView from "@/components/WebView";
import TimelineScene from "@/components/TimelineScene";

type Phase = "intro" | "web" | "timeline";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [images, setImages] = useState<string[]>([]);
  const [jumpToGroupId, setJumpToGroupId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then((res) => setImages(res.images ?? []))
      .catch(() => setImages([]));
  }, []);

  return (
    <main className="relative flex-1">
      {phase === "intro" && <IntroAnimation onDone={() => setPhase("web")} />}
      {phase === "web" && (
        <WebView
          images={images}
          onSelect={(groupId) => {
            setJumpToGroupId(groupId);
            setPhase("timeline");
          }}
        />
      )}
      {phase === "timeline" && (
        <TimelineScene
          images={images}
          jumpToGroupId={jumpToGroupId}
          onBack={() => setPhase("web")}
        />
      )}
    </main>
  );
}
