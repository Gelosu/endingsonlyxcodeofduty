import { NextResponse } from "next/server";
import fs from "fs/promises";
import { UPLOADS_DIR, IMAGE_EXTENSIONS } from "@/lib/paths";

export async function GET() {
  try {
    const entries = await fs.readdir(UPLOADS_DIR);
    const images = entries
      .filter((name) => IMAGE_EXTENSIONS.includes(name.slice(name.lastIndexOf(".")).toLowerCase()))
      .sort();
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
