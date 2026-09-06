import path from "path";

export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
export const POSITIONS_FILE = path.join(process.cwd(), "data", "positions.json");
export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"];

// Uploads that aren't actual memory photos (title cards, logos, etc.) —
// kept in the folder, but never shown as a card in the web or timeline.
export const EXCLUDED_IMAGES = new Set(["2-8.png"]);
