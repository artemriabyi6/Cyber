// app/api/next-trainings/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { id } = await params
    const { userId, date, time, type, focus, trainingPlanId } = await request.json()

    const nextTraining = await prisma.nextTraining.update({
      where: { id: id },
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
    console.error('Помилка оновлення наступного тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { id } = await params

    await prisma.nextTraining.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Наступне тренування видалено' })
  } catch (error) {
    console.error('Помилка видалення наступного тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}

// Додайте GET метод, якщо потрібно отримувати конкретне тренування
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { id } = await params

    const nextTraining = await prisma.nextTraining.findFirst({
      where: { id: id },
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

    if (!nextTraining) {
      return NextResponse.json({ error: 'Тренування не знайдено' }, { status: 404 })
    }

    return NextResponse.json(nextTraining)
  } catch (error) {
    console.error('Помилка отримання наступного тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}