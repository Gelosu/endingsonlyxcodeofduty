export type MemoryGroup = { id: string; label: string; items: string[] };

// Parses "N-M.png" (a photo M from source page N) into a group + order.
// Anything that doesn't match that shape becomes its own single-item group,
// sorted after the numbered ones.
export function groupImages(images: string[]): MemoryGroup[] {
  const numbered = new Map<number, string[]>();
  const rest: string[] = [];

  for (const name of images) {
    const match = name.match(/^(\d+)-(\d+)\./);
    if (match) {
      const groupId = Number(match[1]);
      const list = numbered.get(groupId) ?? [];
      list.push(name);
      numbered.set(groupId, list);
    } else {
      rest.push(name);
    }
  }

  const groups: MemoryGroup[] = [...numbered.entries()]
    .sort(([a], [b]) => a - b)
    .map(([id, items]) => ({
      id: `memory-${id}`,
      label: `Memory ${String(id).padStart(2, "0")}`,
      items: items.sort((a, b) => {
        const na = Number(a.match(/^\d+-(\d+)\./)?.[1] ?? 0);
        const nb = Number(b.match(/^\d+-(\d+)\./)?.[1] ?? 0);
        return na - nb;
      }),
    }));

  if (rest.length > 0) {
    groups.push({ id: "unsorted", label: "More", items: rest.sort() });
  }

  return groups;
}

// A short friendship-themed line for each memory, in the order the
// memories appear. Runs out? it loops the fallback line at the end.
const QUOTES = [
  "Friendship isn't a chapter — it's the story that keeps writing itself.",
  "We didn't just survive this together; we built a home in each other.",
  "Some bonds are timestamped. Ours never expire.",
  "Every deadline, every laugh, every 3AM panic — shared, and somehow lighter for it.",
  "We came in as strangers in a group chat. We're leaving as family.",
  "Distance and diplomas can't unmake what we made together.",
  "This isn't the end of the group project. It's the start of the group life.",
  "Built different — built with friendship, brick by brick, memory by memory.",
  "From the first icebreaker to whatever's next: still us, always us.",
];
const FALLBACK_QUOTE = "Some memories don't fit in order — they just fit.";

export function quoteFor(index: number): string {
  return QUOTES[index] ?? FALLBACK_QUOTE;
}
