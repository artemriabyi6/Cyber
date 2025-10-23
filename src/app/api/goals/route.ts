// app/api/goals/route.ts
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

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Помилка завантаження цілей:', error)
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

    const {
      title,
      description,
      category,
      targetValue,
      deadline,
      priority,
      exercises
    } = await request.json()

    if (!title || !category || !targetValue || !deadline) {
      return NextResponse.json(
        { error: 'Обов\'язкові поля: назва, категорія, цільове значення, дедлайн' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description: description || '',
        category,
        targetValue: parseInt(targetValue),
        deadline,
        priority: priority || 'medium',
        exercises: exercises || [],
        userId: session.user.id,
        currentValue: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Помилка створення цілі:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}