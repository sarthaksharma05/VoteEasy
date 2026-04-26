import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { registrationStatus: "PENDING" },
      select: {
        id: true,
        name: true,
        email: true,
        registrationData: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users: pendingUsers }, { status: 200 });
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json({ message: "Failed to fetch pending applications." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
    }

    if (action === "APPROVE") {
      await prisma.user.update({
        where: { id: userId },
        data: { registrationStatus: "VERIFIED" },
      });
      return NextResponse.json({ message: "User verified successfully." }, { status: 200 });
    }

    if (action === "REJECT") {
      await prisma.user.update({
        where: { id: userId },
        data: { registrationStatus: "UNREGISTERED", registrationData: null },
      });
      return NextResponse.json({ message: "User application rejected." }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Admin Action Error:", error);
    return NextResponse.json({ message: "Failed to process application." }, { status: 500 });
  }
}
