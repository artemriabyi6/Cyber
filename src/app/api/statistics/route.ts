// app/api/statistics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

// Інтерфейси для типів даних
interface TrainingSession {
  id: string;
  userId: string;
  trainingPlanId: string | null;
  date: string;
  duration: string;
  performance: number;
  coachNotes: string;
  completed: boolean;
}

interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  status: string;
  deadline: string | null;
}

interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  achievedAt: string;
  type: string;
}

interface ProgressStat {
  id: string;
  userId: string;
  skill: string;
  icon: string;
  current: number;
  previous: number;
  updatedAt?: string; // Зробимо опціональним
}

interface MonthlyStat {
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

interface RecentTraining {
  id: string;
  date: string;
  duration: string;
  performance: number;
  title: string;
  completed: boolean;
}

interface GoalProgress {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  status: string;
}

interface StatisticsResponse {
  overview: {
    totalTrainings: number;
    completedTrainings: number;
    totalTrainingTime: number;
    averagePerformance: number;
    totalGoals: number;
    completedGoals: number;
    achievementsCount: number;
  };
  monthlyStats: MonthlyStat[];
  skillProgress: SkillProgress[];
  recentTrainings: RecentTraining[];
  goalsProgress: GoalProgress[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    console.log('Отримання статистики для userId:', session.user.id);

    // Отримуємо всі дані для статистики
    const [
      progressStats,
      trainingSessions,
      goals,
      achievements
    ] = await Promise.all([
      prisma.progressStat.findMany({
        where: { userId: session.user.id },
        orderBy: { current: 'desc' }
      }),
      prisma.trainingSession.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' }
      }),
      prisma.goal.findMany({
        where: { userId: session.user.id }
      }),
      prisma.achievement.findMany({
        where: { userId: session.user.id }
      })
    ]);

    console.log('Знайдено тренувань:', trainingSessions.length);
    console.log('Знайдено цілей:', goals.length);
    console.log('Знайдено досягнень:', achievements.length);
    console.log('Знайдено статистик прогресу:', progressStats.length);

    // Детальна інформація про тренування
    if (trainingSessions.length > 0) {
      console.log('Перше тренування:', {
        id: trainingSessions[0].id,
        date: trainingSessions[0].date,
        duration: trainingSessions[0].duration,
        performance: trainingSessions[0].performance,
        completed: trainingSessions[0].completed
      });
    }

    // Розраховуємо додаткову статистику
    const completedTrainings = trainingSessions.filter(session => session.completed);
    console.log('Завершених тренувань:', completedTrainings.length);

    const totalTrainingTime = completedTrainings.reduce((total, session) => {
      // Конвертуємо duration у хвилини (припускаємо формат "XX min")
      const durationMatch = session.duration.match(/(\d+)/);
      const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 0;
      return total + durationMinutes;
    }, 0);

    const averagePerformance = completedTrainings.length > 0 
      ? completedTrainings.reduce((sum, session) => sum + session.performance, 0) / completedTrainings.length
      : 0;

    const monthlyStats = calculateMonthlyStats(trainingSessions);
    const skillProgress = calculateSkillProgress(progressStats);

    const statistics: StatisticsResponse = {
      overview: {
        totalTrainings: trainingSessions.length,
        completedTrainings: completedTrainings.length,
        totalTrainingTime, // в хвилинах
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
        title: `Тренування ${new Date(session.date).toLocaleDateString('uk-UA')}`,
        completed: session.completed
      })),
      goalsProgress: goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        status: goal.status
      }))
    };

    console.log('Фінальна статистика:', statistics.overview);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Помилка завантаження статистики:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

function calculateMonthlyStats(trainingSessions: TrainingSession[]): MonthlyStat[] {
  const monthlyData: { [key: string]: { count: number; totalPerformance: number } } = {};
  
  trainingSessions.forEach(session => {
    if (session.completed) {
      const month = session.date.substring(0, 7); // Формат "YYYY-MM"
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
  })).slice(-6); // Останні 6 місяців
}

function calculateSkillProgress(progressStats: ProgressStat[]): SkillProgress[] {
  return progressStats.map(stat => {
    const improvement = stat.current - stat.previous;
    const improvementPercent = stat.previous > 0 
      ? ((improvement / stat.previous) * 100).toFixed(1)
      : "100.0";

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