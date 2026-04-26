import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    const payload = verifyToken(token);

    const chats = await prisma.chat.findMany({
      where: { userId: payload.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error) {
    console.error("Fetch Chats Error:", error);
    return NextResponse.json({ message: "Failed to fetch chats." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    const payload = verifyToken(token);

    const newChat = await prisma.chat.create({
      data: {
        userId: payload.userId,
        title: "New Chat",
      },
      include: {
        messages: true
      }
    });

    return NextResponse.json({ chat: newChat }, { status: 200 });
  } catch (error) {
    console.error("Create Chat Error:", error);
    return NextResponse.json({ message: "Failed to create chat." }, { status: 500 });
  }
}
