// app/api/achievements/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 })
    }

    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      take: 4
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Помилка завантаження досягнень:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}