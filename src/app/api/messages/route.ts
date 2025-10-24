// app/api/messages/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const receiverId = searchParams.get('receiverId')

    // Отримуємо повідомлення між поточним користувачем та обраним користувачем
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: receiverId || undefined
          },
          {
            senderId: receiverId || undefined,
            receiverId: session.user.id
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Помилка завантаження повідомлень:', error)
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

    const { text, receiverId } = await request.json()

    if (!text || !receiverId) {
      return NextResponse.json(
        { error: 'Текст та отримувач обов\'язкові' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        text,
        senderId: session.user.id,
        receiverId,
        timestamp: new Date(),
        read: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Помилка відправки повідомлення:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}