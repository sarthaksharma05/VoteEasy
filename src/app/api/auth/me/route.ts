import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || ''
    const token = cookie
      .split(';')
      .find(c => c.trim().startsWith('voteeasy_token='))
      ?.split('=')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          preferredLanguage: true,
          registrationStatus: true,
          chats: {
            select: { id: true }
          }
        }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

      const chatCount = user.chats?.length || 0

      // Fetch registrationData separately to satisfy TypeScript typings
      const regDataRes = await prisma.user.findUnique({ where: { id: user.id }, select: { registrationData: true } });
      const registrationData = regDataRes?.registrationData ?? null;

      // Auto-verify if 30 seconds have passed since submission
      if (user.registrationStatus === 'PENDING' && registrationData) {
        const { resolveAutoVerification } = await import('@/lib/registration-status');
        await resolveAutoVerification(user.id, user.registrationStatus, registrationData);

        // Fetch updated status
        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { registrationStatus: true }
        });
        if (updatedUser) {
          user.registrationStatus = updatedUser.registrationStatus;
        }
      }

      return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        preferredLanguage: user.preferredLanguage,
        registrationStatus: user.registrationStatus,
      },
        registrationStatus: user.registrationStatus,
        chatCount: chatCount
      })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
