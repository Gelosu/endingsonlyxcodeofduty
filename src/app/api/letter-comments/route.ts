import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

type Comment = { id: string; name: string; text: string; createdAt: string };

// Replies left on a letter — kept in their own table, keyed by the
// letter's slug (e.g. "daniel"), so the recipient can write back to Gelo.

export async function GET(request: Request) {
  const letter = new URL(request.url).searchParams.get("letter");
  if (!letter) {
    return NextResponse.json({ error: "Missing letter" }, { status: 400 });
  }

  const rows = await sql`
    SELECT id, name, text, created_at FROM letter_comments WHERE letter = ${letter} ORDER BY created_at ASC
  `;
  const comments: Comment[] = (rows as { id: string; name: string; text: string; created_at: string }[]).map((r) => ({
    id: r.id,
    name: r.name,
    text: r.text,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const letter = typeof body?.letter === "string" ? body.letter.trim().toLowerCase() : "";
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 800) : "";
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim().slice(0, 40) : "Anonymous";

  if (!letter || !text) {
    return NextResponse.json({ error: "Missing letter or text" }, { status: 400 });
  }

  await sql`INSERT INTO letter_comments (letter, name, text) VALUES (${letter}, ${name}, ${text})`;

  const rows = await sql`
    SELECT id, name, text, created_at FROM letter_comments WHERE letter = ${letter} ORDER BY created_at ASC
  `;
  const comments: Comment[] = (rows as { id: string; name: string; text: string; created_at: string }[]).map((r) => ({
    id: r.id,
    name: r.name,
    text: r.text,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ comments });
}
