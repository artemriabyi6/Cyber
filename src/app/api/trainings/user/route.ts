// app/api/training-sessions/user/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 })
    }

    const trainingSessions = await prisma.trainingSession.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(trainingSessions)
  } catch (error) {
    console.error('Помилка завантаження тренувань:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}