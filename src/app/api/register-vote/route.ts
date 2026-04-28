import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const body = await request.json();
    const registrationPayload = {
      ...body,
      __submittedAt: new Date().toISOString(),
    };

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        registrationStatus: "PENDING",
        registrationData: JSON.stringify(registrationPayload),
      },
    });

    return NextResponse.json({ message: "Registration submitted successfully", status: user.registrationStatus }, { status: 200 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Failed to submit registration." }, { status: 500 });
  }
}
