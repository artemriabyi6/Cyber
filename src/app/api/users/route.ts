// app/api/users/route.ts
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

    // Отримуємо всіх користувачів крім поточного
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Помилка завантаження користувачів:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}