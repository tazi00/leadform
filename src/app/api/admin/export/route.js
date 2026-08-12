import { NextResponse } from "next/server";
import { listSubmissions, markExported } from "@/lib/db";
import { appendRowsByCourse } from "@/lib/googleSheets";

export async function POST() {
  try {
    const submissions = await listSubmissions();
    const pending = submissions.filter((s) => !s.exported);

    if (pending.length === 0) {
      return NextResponse.json({ ok: true, exportedCount: 0 });
    }

    // Group rows by course — each course goes to its own tab
    const grouped = {};
    for (const s of pending) {
      const courseKey = s.course || "General";
      const row = [
        s.createdAt,
        [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
        s.phone,
        s.gender,
        [s.addressLine1, s.addressLine2].filter(Boolean).join(", "),
        s.course,
      ];
      grouped[courseKey] = grouped[courseKey] || [];
      grouped[courseKey].push(row);
    }

    await appendRowsByCourse(grouped);
    await markExported(pending.map((s) => s.id));

    return NextResponse.json({ ok: true, exportedCount: pending.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Export failed" },
      { status: 500 }
    );
  }
}
