import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { verifyToken } from "@/lib/auth";
import { getUserWithSettings } from "@/lib/user-settings";

export const dynamic = "force-dynamic";

interface StoredRegistrationData {
  proofOfAgeName?: string;
  proofOfAddressName?: string;
  photoName?: string;
  __submittedAt?: string;
}

function getDocumentType(name: string) {
  const normalized = name.toLowerCase();
  return normalized.endsWith(".pdf") ? "pdf" : "image";
}

function getDocumentStatus(registrationStatus: string): "Verified" | "Pending" | "Rejected" {
  if (registrationStatus === "VERIFIED") {
    return "Verified";
  }

  if (registrationStatus === "PENDING") {
    return "Pending";
  }

  return "Rejected";
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const user = await getUserWithSettings(payload.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const registrationData = user.registrationData
      ? (JSON.parse(user.registrationData) as StoredRegistrationData)
      : null;

    const uploadedDate = registrationData?.__submittedAt
      ? new Date(registrationData.__submittedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

    const storedDocuments = [
      {
        id: "proof-of-age",
        label: "Proof of Age",
        name: registrationData?.proofOfAgeName,
      },
      {
        id: "proof-of-address",
        label: "Proof of Address",
        name: registrationData?.proofOfAddressName,
      },
      {
        id: "passport-photo",
        label: "Passport Photograph",
        name: registrationData?.photoName,
      },
    ]
      .filter((document) => Boolean(document.name))
      .map((document) => ({
        id: document.id,
        category: document.label,
        name: document.name as string,
        date: uploadedDate,
        status: getDocumentStatus(user.registrationStatus),
        type: getDocumentType(document.name as string),
      }));

    return NextResponse.json({ documents: storedDocuments }, { status: 200 });
  } catch (error) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ message: "Failed to load documents." }, { status: 500 });
  }
}
