// app/api/users/students/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    // Перевіряємо, чи користувач є тренером
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'coach') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    // Отримуємо всіх учнів
    const students = await prisma.user.findMany({
      where: {
        role: 'student'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Помилка завантаження учнів:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}