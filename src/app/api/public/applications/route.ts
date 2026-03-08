import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, gender, dateOfBirth, residentialAddress, preferredSection, musicalExperience, message } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "First name, last name, email, and phone are required" }, { status: 400 });
    }

    const application = await prisma.memberApplication.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        residentialAddress: residentialAddress || null,
        preferredSection: preferredSection || null,
        musicalExperience: musicalExperience || null,
        message: message || null,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
