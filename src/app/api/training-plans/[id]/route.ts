// app/api/training-plans/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const data = await request.json()

    const trainingPlan = await prisma.trainingPlan.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json(trainingPlan)
  } catch (error) {
    console.error('Помилка оновлення тренування:', error)
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

    await prisma.trainingPlan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Тренування видалено' })
  } catch (error) {
    console.error('Помилка видалення тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}