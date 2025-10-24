// app/api/training-plans/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './../../../../lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const trainingPlans = await prisma.trainingPlan.findMany({
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(trainingPlans)
  } catch (error) {
    console.error('Помилка завантаження тренувань:', error)
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

    const { title, duration, intensity, exercises, assignedTo, date } = await request.json()

    if (!title || !date || !assignedTo || assignedTo.length === 0) {
      return NextResponse.json(
        { error: 'Обов\'язкові поля: назва, дата, призначені учні' },
        { status: 400 }
      )
    }

    const trainingPlan = await prisma.trainingPlan.create({
      data: {
        title,
        duration: duration || '45 хв',
        intensity: intensity || 'medium',
        exercises: exercises || [],
        assignedTo,
        createdBy: session.user.id,
        date,
        completed: false
      }
    })

    return NextResponse.json(trainingPlan)
  } catch (error) {
    console.error('Помилка створення тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}