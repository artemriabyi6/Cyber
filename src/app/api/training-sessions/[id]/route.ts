import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    // Фільтруємо тренування по userId
    const trainingSessions = await prisma.trainingSession.findMany({
      where: { 
        userId: session.user.id // Тільки тренування поточного користувача
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
      
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(trainingSessions)
  } catch (error) {
    console.error('Помилка завантаження сесій тренувань:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { trainingPlanId, date, duration, performance, coachNotes, completed } = await request.json()

    const trainingSession = await prisma.trainingSession.create({
      data: {
        trainingPlanId: trainingPlanId || null,
        userId: session.user.id, // Важливо: використовуємо ID поточного користувача
        date,
        duration,
        performance,
        coachNotes,
        completed: completed || false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
      
      }
    })

    return NextResponse.json(trainingSession)
  } catch (error) {
    console.error('Помилка створення сесії тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}