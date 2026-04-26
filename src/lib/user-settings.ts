import { prisma } from "@/lib/prisma";

interface UserSettingsRow {
  id: string;
  name: string;
  email: string;
  password: string;
  mobile: string | null;
  preferredLanguage: string | null;
  theme: string | null;
  notifications: string | null;
  profilePhoto: string | null;
  createdAt: Date;
  registrationStatus: string;
  registrationData: string | null;
}

const USER_SETTING_COLUMN_STATEMENTS = [
  'ALTER TABLE "User" ADD COLUMN "mobile" TEXT',
  'ALTER TABLE "User" ADD COLUMN "preferredLanguage" TEXT DEFAULT \'English\'',
  'ALTER TABLE "User" ADD COLUMN "theme" TEXT DEFAULT \'Light\'',
  'ALTER TABLE "User" ADD COLUMN "notifications" TEXT',
  'ALTER TABLE "User" ADD COLUMN "profilePhoto" TEXT',
];

let ensuredColumns = false;

function isDuplicateColumnError(error: unknown) {
  return error instanceof Error && /duplicate column name/i.test(error.message);
}

export async function ensureUserSettingsColumns() {
  if (ensuredColumns) {
    return;
  }

  for (const statement of USER_SETTING_COLUMN_STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (error) {
      if (!isDuplicateColumnError(error)) {
        throw error;
      }
    }
  }

  ensuredColumns = true;
}

export async function getUserWithSettings(userId: string) {
  await ensureUserSettingsColumns();

  const rows = await prisma.$queryRawUnsafe<UserSettingsRow[]>(
    `SELECT
      id,
      name,
      email,
      password,
      mobile,
      preferredLanguage,
      theme,
      notifications,
      profilePhoto,
      createdAt,
      registrationStatus,
      registrationData
    FROM "User"
    WHERE id = ?
    LIMIT 1`,
    userId,
  );

  return rows[0] ?? null;
}

export async function updateUserSettingsRow(params: {
  userId: string;
  name: string;
  email: string;
  mobile: string | null;
  preferredLanguage: string;
  theme: string;
  notifications: string | null;
  profilePhoto: string | null;
}) {
  await ensureUserSettingsColumns();

  await prisma.$executeRawUnsafe(
    `UPDATE "User"
     SET name = ?, email = ?, mobile = ?, preferredLanguage = ?, theme = ?, notifications = ?, profilePhoto = ?
     WHERE id = ?`,
    params.name,
    params.email,
    params.mobile,
    params.preferredLanguage,
    params.theme,
    params.notifications,
    params.profilePhoto,
    params.userId,
  );

  return getUserWithSettings(params.userId);
}

export async function updateUserPasswordRow(userId: string, password: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { password },
  });
}

export async function deleteUserRow(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });
}
