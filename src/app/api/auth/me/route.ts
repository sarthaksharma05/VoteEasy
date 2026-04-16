import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { isTokenError, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7);
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? getBearerToken(request);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        createdAt: true,
        email: true,
        id: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        user,
        stats: [
          { label: "Registration Status", value: "Active" },
          { label: "Saved Documents", value: "3" },
          { label: "Deadline Alerts", value: "2" },
        ],
      },
      { status: 200 },
    );
  } catch (error) {
    if (isTokenError(error)) {
      return NextResponse.json({ message: "Invalid session." }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Unable to load your account." },
      { status: 500 },
    );
  }
}
