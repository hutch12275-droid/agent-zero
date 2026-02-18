import { NextRequest, NextResponse } from "next/server";

// In-memory store (in production, use a database)
const memoryStore: Array<{
  id: string;
  content: string;
  tags: string[];
  category: string;
  importance: number;
  createdAt: number;
  accessCount: number;
}> = [];

let memoryIdCounter = 0;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (query) {
    const q = query.toLowerCase();
    const results = memoryStore
      .filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);

    // Increment access counts
    for (const r of results) {
      r.accessCount++;
    }

    return NextResponse.json({ results });
  }

  // Return all memories
  return NextResponse.json({
    memories: memoryStore.sort((a, b) => b.createdAt - a.createdAt),
    total: memoryStore.length,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "save") {
    const entry = {
      id: `mem_${++memoryIdCounter}`,
      content: body.content,
      tags: body.tags || [],
      category: body.category || "general",
      importance: body.importance || 5,
      createdAt: Date.now(),
      accessCount: 0,
    };

    memoryStore.push(entry);
    return NextResponse.json({ success: true, id: entry.id });
  }

  if (body.action === "delete") {
    const idx = memoryStore.findIndex((m) => m.id === body.id);
    if (idx !== -1) {
      memoryStore.splice(idx, 1);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
