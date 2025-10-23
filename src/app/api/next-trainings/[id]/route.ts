// app/api/next-trainings/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { userId, date, time, type, focus, trainingPlanId } = await request.json()

    const nextTraining = await prisma.nextTraining.update({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    await prisma.nextTraining.delete({
      where: { id: params.id }
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