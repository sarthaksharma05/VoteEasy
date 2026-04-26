import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_THEME,
  INDIAN_LANGUAGE_VALUES,
  getStoredTheme,
} from "@/lib/indian-languages";
import { isValidEmail } from "@/lib/auth-helpers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUserRow, getUserWithSettings, updateUserSettingsRow } from "@/lib/user-settings";

function parseNotifications(value?: string | null) {
  if (!value) {
    return DEFAULT_NOTIFICATIONS;
  }

  try {
    return {
      ...DEFAULT_NOTIFICATIONS,
      ...JSON.parse(value),
    };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return getUserWithSettings(payload.userId);
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      {
        profile: {
          name: user.name,
          email: user.email,
          mobile: user.mobile ?? "",
          profilePhoto: user.profilePhoto ?? "",
        },
        notifications: parseNotifications(user.notifications),
        preferences: {
          language: user.preferredLanguage || DEFAULT_LANGUAGE,
          theme: getStoredTheme(user.theme),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ message: "Failed to load settings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const nextName = typeof body.name === "string" ? body.name.trim() : user.name;
    const nextEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : user.email;
    const nextMobile = typeof body.mobile === "string" ? body.mobile.trim() : user.mobile ?? "";
    const nextLanguage = typeof body.language === "string" ? body.language : user.preferredLanguage || DEFAULT_LANGUAGE;
    const nextTheme = getStoredTheme(body.theme ?? user.theme ?? DEFAULT_THEME);
    const nextNotifications = body.notifications
      ? { ...DEFAULT_NOTIFICATIONS, ...body.notifications }
      : parseNotifications(user.notifications);
    const nextProfilePhoto = typeof body.profilePhoto === "string" ? body.profilePhoto : user.profilePhoto ?? "";

    if (!nextName) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    if (!nextEmail || !isValidEmail(nextEmail)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    if (nextMobile && !/^\d{10}$/.test(nextMobile)) {
      return NextResponse.json({ message: "Mobile number must be 10 digits." }, { status: 400 });
    }

    if (!INDIAN_LANGUAGE_VALUES.has(nextLanguage)) {
      return NextResponse.json({ message: "Unsupported language selected." }, { status: 400 });
    }

    if (nextEmail !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ message: "That email address is already in use." }, { status: 409 });
      }
    }

    if (nextProfilePhoto && !nextProfilePhoto.startsWith("data:image/")) {
      return NextResponse.json({ message: "Invalid profile photo format." }, { status: 400 });
    }

    if (nextProfilePhoto.length > 2_800_000) {
      return NextResponse.json({ message: "Profile photo is too large. Keep it under 2MB." }, { status: 400 });
    }

    const updatedUser = await updateUserSettingsRow({
      userId: user.id,
      name: nextName,
      email: nextEmail,
      mobile: nextMobile || null,
      preferredLanguage: nextLanguage,
      theme: nextTheme,
      notifications: JSON.stringify(nextNotifications),
      profilePhoto: nextProfilePhoto || null,
    });

    return NextResponse.json(
      {
        message: "Settings updated successfully.",
        profile: {
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile ?? "",
          profilePhoto: updatedUser.profilePhoto ?? "",
        },
        notifications: nextNotifications,
        preferences: {
          language: updatedUser.preferredLanguage || DEFAULT_LANGUAGE,
          theme: getStoredTheme(updatedUser.theme),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ message: "Failed to save settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    if (typeof body.password === "string" && body.password.trim()) {
      const passwordMatches = await bcrypt.compare(body.password.trim(), user.password);

      if (!passwordMatches) {
        return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
      }
    }

    await deleteUserRow(user.id);

    const response = NextResponse.json({ message: "Account deleted successfully." }, { status: 200 });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Settings DELETE error:", error);
    return NextResponse.json({ message: "Failed to delete account." }, { status: 500 });
  }
}
