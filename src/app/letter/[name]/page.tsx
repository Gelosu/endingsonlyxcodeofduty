"use client";

import { use } from "react";
import LetterView from "@/components/LetterView";
import { findLetter } from "@/lib/letters";

export default function LetterPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const letter = findLetter(decodeURIComponent(name));

  return <LetterView letter={letter} />;
}
