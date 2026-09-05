import path from "path";

export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
export const POSITIONS_FILE = path.join(process.cwd(), "data", "positions.json");
export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"];
