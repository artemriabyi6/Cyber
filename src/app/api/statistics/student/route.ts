// app/api/statistics/student/route.ts
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

    // Отримуємо всі дані для статистики учня
    const [
      trainingSessions,
      trainingPlans,
      goals,
      nextTrainings
    ] = await Promise.all([
      // Тренувальні сесії учня
      prisma.trainingSession.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' }
      }),

      // Плани тренувань учня
      prisma.trainingPlan.findMany({
        where: {
          assignedTo: {
            has: session.user.id
          }
        }
      }),

      // Цілі учня
      prisma.goal.findMany({
        where: { userId: session.user.id }
      }),

      // Наступні тренування
      prisma.nextTraining.findMany({
        where: { userId: session.user.id }
      })
    ]);

    // Розрахунок статистики
    const completedTrainings = trainingSessions.filter(session => session.completed);
    const totalTrainingTime = completedTrainings.reduce((total, session) => {
      const durationMatch = session.duration.match(/(\d+)/);
      return total + (durationMatch ? parseInt(durationMatch[1]) : 0);
    }, 0);

    const averagePerformance = completedTrainings.length > 0 
      ? completedTrainings.reduce((sum, session) => sum + session.performance, 0) / completedTrainings.length
      : 0;

    const successRate = trainingSessions.length > 0 
      ? Math.round((completedTrainings.length / trainingSessions.length) * 100)
      : 0;

    // Формування відповіді
    const statistics = {
      overview: {
        totalTrainings: trainingSessions.length,
        completedTrainings: completedTrainings.length,
        totalTrainingTime,
        averagePerformance: Math.round(averagePerformance),
        totalGoals: goals.length,
        completedGoals: goals.filter(goal => goal.status === 'completed').length,
        upcomingTrainings: trainingPlans.filter(plan => !plan.completed).length,
        successRate
      },
      // ... решта даних
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Помилка завантаження статистики учня:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}