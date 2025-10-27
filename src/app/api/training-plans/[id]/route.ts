// app/api/training-plans/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'


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

    console.log('PATCH запит для тренування:', id, 'користувач:', session.user.id, 'дані:', data)

    // Перевіряємо, чи тренування існує і чи користувач є тренером (автором) по полю createdBy
    const existingPlan = await prisma.trainingPlan.findFirst({
      where: { 
        id: id,
        createdBy: session.user.id // Використовуємо createdBy замість coachId
      }
    })

    console.log('Знайдено тренування:', existingPlan)

    if (!existingPlan) {
      return NextResponse.json({ error: 'Тренування не знайдено або доступ заборонено' }, { status: 404 })
    }

    // Оновлюємо тренування
    const trainingPlan = await prisma.trainingPlan.update({
      where: { id: id },
      data: {
        title: data.title,
        duration: data.duration,
        intensity: data.intensity,
        exercises: data.exercises,
        assignedTo: data.assignedTo,
        date: data.date,
        completed: data.completed,
        completedDate: data.completedDate
      }
    })

    console.log('Тренування оновлено:', trainingPlan)
    return NextResponse.json(trainingPlan)
  } catch (error) {
    console.error('Помилка оновлення тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера: ' + (error instanceof Error ? error.message : 'Невідома помилка') },
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

    console.log('DELETE запит для тренування:', id, 'користувач:', session.user.id)

    // Перевіряємо, чи тренування існує і чи користувач є тренером по полю createdBy
    const existingPlan = await prisma.trainingPlan.findFirst({
      where: { 
        id: id,
        createdBy: session.user.id // Використовуємо createdBy замість coachId
      }
    })

    console.log('Знайдено тренування для видалення:', existingPlan)

    if (!existingPlan) {
      return NextResponse.json({ error: 'Тренування не знайдено або доступ заборонено' }, { status: 404 })
    }

    // Спочатку видаляємо пов'язані сесії тренувань
    await prisma.trainingSession.deleteMany({
      where: {
        trainingPlanId: id
      }
    })

    // Потім видаляємо тренування
    await prisma.trainingPlan.delete({
      where: { id: id }
    })

    console.log('Тренування видалено:', id)
    return NextResponse.json({ message: 'Тренування видалено' })
  } catch (error) {
    console.error('Помилка видалення тренування:', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера: ' + (error instanceof Error ? error.message : 'Невідома помилка') },
      { status: 500 }
    )
  }
}