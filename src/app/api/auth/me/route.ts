import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { isTokenError, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveAutoVerification } from "@/lib/registration-status";
import { getUserWithSettings } from "@/lib/user-settings";

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
    let user = await getUserWithSettings(payload.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const autoVerifiedUser = await resolveAutoVerification(user.id, user.registrationStatus, user.registrationData);
    if (autoVerifiedUser) {
      user = {
        ...user,
        registrationStatus: autoVerifiedUser.registrationStatus,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayChatsCount = await prisma.chat.count({
      where: {
        userId: payload.userId,
        createdAt: { gte: today }
      }
    });

    return NextResponse.json(
      {
        user: {
          createdAt: user.createdAt,
          email: user.email,
          id: user.id,
          mobile: user.mobile,
          name: user.name,
          preferredLanguage: user.preferredLanguage,
          profilePhoto: user.profilePhoto,
          registrationStatus: user.registrationStatus,
          theme: user.theme,
          notifications: user.notifications,
        },
        stats: [
          { label: "Registration Status", value: user.registrationStatus === 'VERIFIED' ? 'Verified' : user.registrationStatus === 'PENDING' ? 'Pending' : 'Incomplete' },
          { label: "Saved Documents", value: "3" }, // Mocked
          { label: "AI Queries Today", value: `${todayChatsCount} Chats` },
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
