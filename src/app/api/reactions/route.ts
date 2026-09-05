import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

type Comment = { id: string; text: string; name: string; createdAt: string };
type Entry = { hearts: number; comments: Comment[] };
type ReactionsMap = Record<string, Entry>;

export async function GET() {
  const [hearts, comments] = await Promise.all([
    sql`SELECT image, hearts FROM image_hearts`,
    sql`SELECT id, image, name, text, created_at FROM image_comments ORDER BY created_at ASC`,
  ]);

  const all: ReactionsMap = {};
  for (const row of hearts as { image: string; hearts: number }[]) {
    all[row.image] = { hearts: row.hearts, comments: [] };
  }
  for (const row of comments as { id: string; image: string; name: string; text: string; created_at: string }[]) {
    const entry = all[row.image] ?? (all[row.image] = { hearts: 0, comments: [] });
    entry.comments.push({ id: row.id, text: row.text, name: row.name, createdAt: row.created_at });
  }

  return NextResponse.json(all);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const image = typeof body?.image === "string" ? body.image : null;
  const action = body?.action;

  if (!image || (action !== "heart" && action !== "comment")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (action === "heart") {
    const [row] = await sql`
      INSERT INTO image_hearts (image, hearts) VALUES (${image}, 1)
      ON CONFLICT (image) DO UPDATE SET hearts = image_hearts.hearts + 1
      RETURNING hearts
    `;
    const comments = await sql`
      SELECT id, name, text, created_at FROM image_comments WHERE image = ${image} ORDER BY created_at ASC
    `;
    return NextResponse.json({
      image,
      hearts: row.hearts,
      comments: (comments as { id: string; name: string; text: string; created_at: string }[]).map((c) => ({
        id: c.id,
        text: c.text,
        name: c.name,
        createdAt: c.created_at,
      })),
    });
  }

  const text = typeof body.text === "string" ? body.text.trim().slice(0, 500) : "";
  if (!text) {
    return NextResponse.json({ error: "Comment text required" }, { status: 400 });
  }
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 40) : "Anonymous";

  await sql`INSERT INTO image_comments (image, name, text) VALUES (${image}, ${name}, ${text})`;

  const [heartsRow] = await sql`SELECT hearts FROM image_hearts WHERE image = ${image}`;
  const comments = await sql`
    SELECT id, name, text, created_at FROM image_comments WHERE image = ${image} ORDER BY created_at ASC
  `;

  return NextResponse.json({
    image,
    hearts: heartsRow?.hearts ?? 0,
    comments: (comments as { id: string; name: string; text: string; created_at: string }[]).map((c) => ({
      id: c.id,
      text: c.text,
      name: c.name,
      createdAt: c.created_at,
    })),
  });
}
