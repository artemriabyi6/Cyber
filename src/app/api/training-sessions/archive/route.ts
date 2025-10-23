// app/api/training-sessions/archive/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    // Знаходимо користувача за email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 })
    }

    // Отримуємо завершені тренування користувача
    const trainingSessions = await prisma.trainingSession.findMany({
      where: {
        userId: user.id,
        completed: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Трансформуємо дані для сумісності з фронтендом
    const formattedSessions = trainingSessions.map(session => ({
      id: session.id,
      title: `Тренування ${session.date}`, // Можна змінити на більш описову назву
      duration: session.duration,
      intensity: "medium" as const, // Додаємо дефолтне значення
      completed: session.completed,
      exercises: [session.coachNotes], // Використовуємо coachNotes як вправи
      assignedTo: [session.userId],
      date: session.date,
      completedDate: session.date,
      performance: session.performance,
      coachNotes: session.coachNotes
    }))

    return NextResponse.json(formattedSessions)
  } catch (error) {
    console.error('Помилка завантаження архіву тренувань:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}