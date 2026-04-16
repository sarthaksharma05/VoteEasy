import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { generateToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { isValidEmail } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = generateToken(user.id);
    const response = NextResponse.json(
      {
        message: "Login successful.",
        token,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      },
      { status: 200 },
    );

    response.cookies.set({
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      name: AUTH_COOKIE_NAME,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: token,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Something went wrong while signing you in." },
      { status: 500 },
    );
  }
}
