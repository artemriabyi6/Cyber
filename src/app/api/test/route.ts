// app/api/test/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const usersCount = await prisma.user.count()
    const trainingSessionsCount = await prisma.trainingSession.count()
    const messagesCount = await prisma.message.count()

    return NextResponse.json({
      message: '✅ PostgreSQL підключено успішно!',
      stats: {
        users: usersCount,
        trainingSessions: trainingSessionsCount,
        messages: messagesCount
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: '❌ Помилка підключення до бази даних' },
      { status: 500 }
    )
  }
}