import { prisma } from "@/lib/prisma";

export async function getUserWithSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
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
  const user = await prisma.user.update({
    where: { id: params.userId },
    data: {
      name: params.name,
      email: params.email,
      mobile: params.mobile,
      preferredLanguage: params.preferredLanguage,
      theme: params.theme,
      notifications: params.notifications,
      profilePhoto: params.profilePhoto,
    },
  });
  return user;
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
