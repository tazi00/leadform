import { NextResponse } from "next/server";
import { appendRegistrationRow } from "@/lib/googleSheets";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      firstName,
      middleName,
      lastName,
      phone,
      gender,
      addressLine1,
      addressLine2,
      course,
      agreeFees,
      agreeTerms,
    } = body;

    if (!firstName || !lastName || !phone || !gender || !course) {
      return NextResponse.json(
        { error: "Please fill all required fields." },
        { status: 400 }
      );
    }

    if (!agreeFees || !agreeTerms) {
      return NextResponse.json(
        { error: "Please accept both checkboxes to continue." },
        { status: 400 }
      );
    }

    const name = [firstName, middleName, lastName]
      .filter(Boolean)
      .map((s) => String(s).trim())
      .join(" ");
    const address = [addressLine1, addressLine2]
      .filter(Boolean)
      .map((s) => String(s).trim())
      .join(", ");

    const row = [
      new Date().toISOString(),
      name,
      String(phone).trim(),
      gender,
      address,
      course,
    ];

    await appendRegistrationRow(course, row);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
