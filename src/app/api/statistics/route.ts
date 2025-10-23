// app/api/statistics/route.ts
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

    // Отримуємо всі дані для статистики
    const [
      progressStats,
      trainingSessions,
      goals,
      achievements
    ] = await Promise.all([
      // Статистика прогресу
      prisma.progressStat.findMany({
        where: { userId: session.user.id },
        orderBy: { current: 'desc' }
      }),

      // Тренування
      prisma.trainingSession.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' }
      }),

      // Цілі
      prisma.goal.findMany({
        where: { userId: session.user.id }
      }),

      // Досягнення
      prisma.achievement.findMany({
        where: { userId: session.user.id }
      })
    ]);

    // Розраховуємо додаткову статистику
    const completedTrainings = trainingSessions.filter(session => session.completed);
    const totalTrainingTime = completedTrainings.reduce((total, session) => {
      const duration = parseInt(session.duration) || 0;
      return total + duration;
    }, 0);

    const averagePerformance = completedTrainings.length > 0 
      ? completedTrainings.reduce((sum, session) => sum + session.performance, 0) / completedTrainings.length
      : 0;

    const monthlyStats = calculateMonthlyStats(trainingSessions);
    const skillProgress = calculateSkillProgress(progressStats);

    const statistics = {
      overview: {
        totalTrainings: trainingSessions.length,
        completedTrainings: completedTrainings.length,
        totalTrainingTime,
        averagePerformance: Math.round(averagePerformance),
        totalGoals: goals.length,
        completedGoals: goals.filter(goal => goal.status === 'completed').length,
        achievementsCount: achievements.length
      },
      monthlyStats,
      skillProgress,
      recentTrainings: trainingSessions.slice(0, 10),
      goalsProgress: goals
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Помилка завантаження статистики:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// Допоміжні функції залишаються без змін
function calculateMonthlyStats(trainingSessions: any[]) {
  const monthlyData: { [key: string]: { count: number; totalPerformance: number } } = {};
  
  trainingSessions.forEach(session => {
    if (session.completed) {
      const month = session.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, totalPerformance: 0 };
      }
      monthlyData[month].count++;
      monthlyData[month].totalPerformance += session.performance;
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    trainings: data.count,
    averagePerformance: Math.round(data.totalPerformance / data.count)
  })).slice(-6);
}

function calculateSkillProgress(progressStats: any[]) {
  return progressStats.map(stat => ({
    skill: stat.skill,
    icon: stat.icon,
    current: stat.current,
    previous: stat.previous,
    improvement: stat.current - stat.previous,
    improvementPercent: ((stat.current - stat.previous) / stat.previous * 100).toFixed(1)
  }));
}