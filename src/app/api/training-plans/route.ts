// app/api/training-plans/route.ts
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

    console.log('Отримання training-plans для userId:', session.user.id, 'роль:', session.user.role);

    if (session.user.role === 'coach') {
      // Для тренера - показуємо тренування, які він створив (перевіряємо по createdBy)
      const trainingPlans = await prisma.trainingPlan.findMany({
        where: {
          createdBy: session.user.id
        },
        orderBy: {
          date: 'desc'
        }
      })
      console.log('Для тренера знайдено:', trainingPlans.length);
      return NextResponse.json(trainingPlans)
    } else {
      // Для учня - показуємо тренування, де він є в assignedTo
      const trainingPlans = await prisma.trainingPlan.findMany({
        where: {
          assignedTo: {
            has: session.user.id
          }
        },
        orderBy: {
          date: 'desc'
        }
      })
      console.log('Для учня знайдено:', trainingPlans.length);
      return NextResponse.json(trainingPlans)
    }

  } catch (error) {
    console.error('Помилка завантаження планів тренувань:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера: ' + (error instanceof Error ? error.message : 'Невідома помилка') },
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

    const data = await request.json()

    const trainingPlan = await prisma.trainingPlan.create({
      data: {
        ...data,
        createdBy: session.user.id, // Використовуємо createdBy замість coachId
      }
    })

    return NextResponse.json(trainingPlan)
  } catch (error) {
    console.error('Помилка створення тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера: ' + (error instanceof Error ? error.message : 'Невідома помилка') },
      { status: 500 }
    )
  }
}