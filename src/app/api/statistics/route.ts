// app/api/statistics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

// Додаємо інтерфейси для типів Prisma
interface TrainingSession {
  id: string;
  userId: string;
  date: string;
  duration: string;
  performance: number;
  completed: boolean;
  trainingPlanId: string | null; // Додаємо можливість null
  coachNotes: string;
}

interface ProgressStat {
  id: string;
  userId: string;
  skill: string;
  current: number;
  previous: number;
  icon: string;
}

// interface Goal {
//   id: string;
//   userId: string;
//   title: string;
//   description: string | null;
//   targetValue: number;
//   currentValue: number;
//   status: string;
//   deadline: string | null;
// }

// interface Achievement {
//   id: string;
//   userId: string;
//   title: string;
//   description: string;
//   icon: string;
//   date: string;
// }

interface MonthlyStats {
  month: string;
  trainings: number;
  averagePerformance: number;
}

interface SkillProgress {
  skill: string;
  icon: string;
  current: number;
  previous: number;
  improvement: number;
  improvementPercent: string;
}

// interface RecentTraining {
//   id: string;
//   date: string;
//   duration: string;
//   performance: number;
//   title: string;
// }

// interface GoalProgress {
//   id: string;
//   title: string;
//   currentValue: number;
//   targetValue: number;
// }

export async function GET() {
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
      recentTrainings: trainingSessions.slice(0, 10).map(session => ({
        id: session.id,
        date: session.date,
        duration: session.duration,
        performance: session.performance,
        title: `Тренування ${new Date(session.date).toLocaleDateString('uk-UA')}`
      })),
      goalsProgress: goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue
      }))
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

// Допоміжні функції з правильними типами
function calculateMonthlyStats(trainingSessions: TrainingSession[]): MonthlyStats[] {
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

function calculateSkillProgress(progressStats: ProgressStat[]): SkillProgress[] {
  return progressStats.map(stat => {
    const improvement = stat.current - stat.previous;
    const improvementPercent = stat.previous > 0 
      ? ((improvement / stat.previous) * 100).toFixed(1)
      : "0.0";

    return {
      skill: stat.skill,
      icon: stat.icon,
      current: stat.current,
      previous: stat.previous,
      improvement: improvement,
      improvementPercent: improvementPercent
    };
  });
}