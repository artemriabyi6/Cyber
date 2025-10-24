// app/api/goals/[id]/route.ts
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

    const { currentValue, status } = await request.json()

    const goal = await prisma.goal.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        ...(currentValue !== undefined && { currentValue: parseInt(currentValue) }),
        ...(status && { status })
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Помилка оновлення цілі:', error)
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

    await prisma.goal.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Ціль видалено' })
  } catch (error) {
    console.error('Помилка видалення цілі:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}