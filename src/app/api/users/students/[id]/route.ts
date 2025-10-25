// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'

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

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Помилка завантаження користувача:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}

// Додайте інші методи, якщо потрібно (PATCH, DELETE тощо)
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

    // Додаткова перевірка прав доступу, якщо потрібно
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const user = await prisma.user.update({
      where: { id: id },
      data: {
        ...data,
        // Виключіть поля, які не можна оновлювати
        email: undefined,
        createdAt: undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Помилка оновлення користувача:', error)
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

    // Додаткова перевірка прав доступу
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Користувача видалено' })
  } catch (error) {
    console.error('Помилка видалення користувача:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}