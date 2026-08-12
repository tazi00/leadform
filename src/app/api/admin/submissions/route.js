import { NextResponse } from "next/server";
import { listAllSubmissions, deleteSubmissionRow } from "@/lib/googleSheets";

export async function GET() {
  try {
    const submissions = await listAllSubmissions();
    return NextResponse.json({ submissions });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Could not load submissions" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteSubmissionRow(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500 }
    );
  }
}
