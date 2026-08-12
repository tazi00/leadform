import { NextResponse } from "next/server";
import { addSubmission } from "@/lib/db";

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

    const record = await addSubmission({
      type: "registration",
      firstName: String(firstName).trim(),
      middleName: middleName ? String(middleName).trim() : "",
      lastName: String(lastName).trim(),
      phone: String(phone).trim(),
      gender,
      addressLine1: addressLine1 ? String(addressLine1).trim() : "",
      addressLine2: addressLine2 ? String(addressLine2).trim() : "",
      course,
      agreeFees: !!agreeFees,
      agreeTerms: !!agreeTerms,
    });

    return NextResponse.json({ ok: true, record });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
