import { prisma } from "@/lib/prisma";

const AUTO_VERIFY_DELAY_MS = 10 * 60 * 1000;

interface RegistrationDataWithMeta {
  __submittedAt?: string;
}

function getSubmittedAt(registrationData: string | null) {
  if (!registrationData) {
    return null;
  }

  try {
    const parsed = JSON.parse(registrationData) as RegistrationDataWithMeta;
    if (!parsed.__submittedAt) {
      return null;
    }

    const submittedAt = new Date(parsed.__submittedAt);
    return Number.isNaN(submittedAt.getTime()) ? null : submittedAt;
  } catch {
    return null;
  }
}

export function shouldAutoVerify(registrationStatus: string, registrationData: string | null, now = new Date()) {
  if (registrationStatus !== "PENDING") {
    return false;
  }

  const submittedAt = getSubmittedAt(registrationData);
  if (!submittedAt) {
    return Boolean(registrationData);
  }

  return now.getTime() - submittedAt.getTime() >= AUTO_VERIFY_DELAY_MS;
}

export async function resolveAutoVerification(userId: string, registrationStatus: string, registrationData: string | null) {
  if (!shouldAutoVerify(registrationStatus, registrationData)) {
    return null;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { registrationStatus: "VERIFIED" },
  });
}
