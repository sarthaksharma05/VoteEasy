import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { verifyToken } from "@/lib/auth";
import { getUserWithSettings, updateUserPasswordRow } from "@/lib/user-settings";

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword.trim() : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "All password fields are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "New password must be at least 8 characters long." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "New passwords do not match." }, { status: 400 });
    }

    const user = await getUserWithSettings(payload.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatches) {
      return NextResponse.json({ message: "Current password is incorrect." }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUserPasswordRow(user.id, hashedPassword);

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ message: "Failed to update password." }, { status: 500 });
  }
}
