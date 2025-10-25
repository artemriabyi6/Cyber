// app/api/training-sessions/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

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

    await prisma.trainingSession.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Сесію тренування видалено' })
  } catch (error) {
    console.error('Помилка видалення сесії тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}

// Додайте інші методи, якщо потрібно (GET, PATCH тощо)
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

    const trainingSession = await prisma.trainingSession.findFirst({
      where: { id: id }
    })

    if (!trainingSession) {
      return NextResponse.json({ error: 'Сесію тренування не знайдено' }, { status: 404 })
    }

    return NextResponse.json(trainingSession)
  } catch (error) {
    console.error('Помилка отримання сесії тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const trainingSession = await prisma.trainingSession.update({
      where: { id: id },
      data
    })

    return NextResponse.json(trainingSession)
  } catch (error) {
    console.error('Помилка оновлення сесії тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}