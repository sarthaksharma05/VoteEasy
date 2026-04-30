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
      const { chats, ...userWithoutChats } = user

      return NextResponse.json({
        user: userWithoutChats,
        registrationStatus: user.registrationStatus,
        chatCount: chatCount
      })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
