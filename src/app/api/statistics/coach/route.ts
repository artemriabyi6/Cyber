// app/api/statistics/coach/route.ts
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

    // Отримуємо всіх учнів
    const students = await prisma.user.findMany({
      where: { role: 'student' }
    });

    // Отримуємо дані всіх учнів
    const studentsData = await Promise.all(
      students.map(async (student) => {
        const trainingSessions = await prisma.trainingSession.findMany({
          where: { userId: student.id }
        });

        const completedTrainings = trainingSessions.filter(session => session.completed);
        const averagePerformance = completedTrainings.length > 0 
          ? completedTrainings.reduce((sum, session) => sum + session.performance, 0) / completedTrainings.length
          : 0;

        const successRate = trainingSessions.length > 0 
          ? Math.round((completedTrainings.length / trainingSessions.length) * 100)
          : 0;

        return {
          studentId: student.id,
          studentName: student.name,
          totalTrainings: trainingSessions.length,
          completedTrainings: completedTrainings.length,
          averagePerformance: Math.round(averagePerformance),
          successRate,
          lastTrainingDate: trainingSessions[0]?.date || 'Не має'
        };
      })
    );

    // Розрахунок загальної статистики
    const totalStats = studentsData.reduce((acc, student) => ({
      totalTrainings: acc.totalTrainings + student.totalTrainings,
      completedTrainings: acc.completedTrainings + student.completedTrainings,
      totalPerformance: acc.totalPerformance + student.averagePerformance,
      totalStudents: studentsData.length,
      activeStudents: studentsData.filter(s => s.completedTrainings > 0).length
    }), { totalTrainings: 0, completedTrainings: 0, totalPerformance: 0, totalStudents: 0, activeStudents: 0 });

    const averagePerformance = totalStats.totalStudents > 0 
      ? Math.round(totalStats.totalPerformance / totalStats.totalStudents)
      : 0;

    const successRate = totalStats.totalTrainings > 0 
      ? Math.round((totalStats.completedTrainings / totalStats.totalTrainings) * 100)
      : 0;

    // Топ учнів
    const topStudents = studentsData
      .filter(student => student.completedTrainings > 0)
      .sort((a, b) => b.averagePerformance - a.averagePerformance)
      .slice(0, 3)
      .map((student, index) => ({
        ...student,
        improvement: Math.floor(Math.random() * 20) - 5 // Приклад поліпшення
      }));

    const statistics = {
      overview: {
        totalStudents: totalStats.totalStudents,
        activeStudents: totalStats.activeStudents,
        totalTrainings: totalStats.totalTrainings,
        completedTrainings: totalStats.completedTrainings,
        totalTrainingTime: 0, // Можна розрахувати
        averagePerformance,
        totalGoals: 0, // Можна додати
        completedGoals: 0, // Можна додати
        upcomingTrainings: 0, // Можна додати
        successRate
      },
      studentsStats: studentsData,
      topStudents,
      // ... решта даних
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Помилка завантаження статистики тренера:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}