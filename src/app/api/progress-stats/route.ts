// app/api/progress-stats/route.ts
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

    const progressStats = await prisma.progressStat.findMany({
      where: { userId: user.id },
      orderBy: { current: 'desc' }
    })

    return NextResponse.json(progressStats)
  } catch (error) {
    console.error('Помилка завантаження статистики:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}