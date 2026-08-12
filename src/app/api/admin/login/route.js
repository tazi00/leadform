import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", adminPassword, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", "", { path: "/", maxAge: 0 });
  return res;
}
