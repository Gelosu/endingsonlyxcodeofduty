import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { POSITIONS_FILE } from "@/lib/paths";

type Positions = Record<string, { x: number; y: number }>;

export async function GET() {
  try {
    const raw = await fs.readFile(POSITIONS_FILE, "utf-8");
    return NextResponse.json(JSON.parse(raw) as Positions);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as Positions;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await fs.mkdir(path.dirname(POSITIONS_FILE), { recursive: true });
  await fs.writeFile(POSITIONS_FILE, JSON.stringify(body, null, 2), "utf-8");

  return NextResponse.json({ ok: true });
}
