import { NextResponse } from "next/server";
import { listSubmissions, deleteSubmission } from "@/lib/db";

export async function GET() {
  const submissions = await listSubmissions();
  return NextResponse.json({ submissions });
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteSubmission(id);
  return NextResponse.json({ ok: true });
}
