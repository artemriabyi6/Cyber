// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password, role = 'student' } = await request.json()

    // Валідація даних
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Усі поля обов\'язкові' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль повинен містити щонайменше 6 символів' },
        { status: 400 }
      )
    }

    // Перевірка, чи існує користувач з таким email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Користувач з таким email вже існує' },
        { status: 400 }
      )
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 12)

    // Створення користувача
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    })

    // Повертаємо дані без пароля
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Користувача успішно створено',
        user: userWithoutPassword 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Помилка реєстрації:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}