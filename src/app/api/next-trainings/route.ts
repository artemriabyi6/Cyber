// app/api/next-trainings/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const nextTrainings = await prisma.nextTraining.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })

    return NextResponse.json(nextTrainings)
  } catch (error) {
    console.error('Помилка завантаження наступних тренувань:', error)
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

    const { userId, date, time, type, focus, trainingPlanId } = await request.json()

    if (!userId || !date || !time || !type) {
      return NextResponse.json(
        { error: 'Обов\'язкові поля: учень, дата, час, тип' },
        { status: 400 }
      )
    }

    const nextTraining = await prisma.nextTraining.create({
      data: {
        userId,
        date,
        time,
        type,
        focus: focus || '',
        trainingPlanId: trainingPlanId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(nextTraining)
  } catch (error) {
    console.error('Помилка створення наступного тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}