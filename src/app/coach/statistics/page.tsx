// app/coach/statistics/page.tsx (виправлена версія)
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TrainingPlan {
  id: string;
  title: string;
  duration: string;
  intensity: string;
  completed: boolean;
  exercises: string[];
  assignedTo: string[];
  date: string;
  completedDate?: string;
  createdBy: string;
}

interface TrainingSession {
  id: string;
  trainingPlanId?: string;
  userId: string;
  date: string;
  duration: string;
  performance: number;
  coachNotes: string;
  completed: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  trainingPlan?: {
    id: string;
    title: string;
    coach?: {
      id: string;
      name: string;
    };
  };
}

interface NextTraining {
  id: string;
  userId: string;
  date: string;
  time: string;
  type: string;
  focus: string;
  trainingPlanId?: string | null;
}

interface CoachStatistics {
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalTrainings: number;
    completedTrainings: number;
    totalTrainingTime: number;
    averagePerformance: number;
    successRate: number;
    upcomingTrainings: number;
  };
  studentsStats: {
    studentId: string;
    studentName: string;
    totalTrainings: number;
    completedTrainings: number;
    averagePerformance: number;
    successRate: number;
    lastTrainingDate: string;
    totalTrainingTime: number;
  }[];
  topStudents: {
    studentId: string;
    studentName: string;
    totalTrainings: number;
    completedTrainings: number;
    averagePerformance: number;
    successRate: number;
    lastTrainingDate: string;
  }[];
  recentActivity: TrainingSession[];
  upcomingTrainings: TrainingPlan[];
  trainingSessions: TrainingSession[];
  trainingPlans: TrainingPlan[];
}

export default function CoachStatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statistics, setStatistics] = useState<CoachStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoachStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error("Користувач не авторизований");
      }

      console.log(
        "Завантаження статистики тренера для userId:",
        session.user.id
      );

      // Використовуємо всі доступні API routes
      const [
        studentsRes,
        trainingPlansRes,
        trainingSessionsRes,
        nextTrainingsRes,
      ] = await Promise.all([
        fetch("/api/users/students"),
        fetch("/api/training-plans"),
        fetch("/api/training-sessions"),
        fetch("/api/next-trainings"),
      ]);

      console.log("Статуси відповідей:", {
        students: studentsRes.status,
        trainingPlans: trainingPlansRes.status,
        trainingSessions: trainingSessionsRes.status,
        nextTrainings: nextTrainingsRes.status,
      });

      if (!studentsRes.ok) {
        throw new Error(`Не вдалося завантажити учнів: ${studentsRes.status}`);
      }
      if (!trainingPlansRes.ok) {
        throw new Error(
          `Не вдалося завантажити тренування: ${trainingPlansRes.status}`
        );
      }

      const students: Student[] = await studentsRes.json();
      const trainingPlans: TrainingPlan[] = await trainingPlansRes.json();
      const trainingSessions: TrainingSession[] = trainingSessionsRes.ok
        ? await trainingSessionsRes.json()
        : [];
      const nextTrainings: NextTraining[] = nextTrainingsRes.ok
        ? await nextTrainingsRes.json()
        : [];

      console.log("Отримані дані:", {
        studentsCount: students.length,
        trainingPlansCount: trainingPlans.length,
        trainingSessionsCount: trainingSessions?.length || 0,
        nextTrainingsCount: nextTrainings.length,
      });

      // Розрахунок статистики для кожного учня
      const studentsStats = students.map((student) => {
        const studentSessions = (trainingSessions || []).filter(
          (session) => session.userId === student.id
        );
        const completedSessions = studentSessions.filter(
          (session) => session.completed
        );

        const totalTrainingTime = completedSessions.reduce((total, session) => {
          const durationMatch = session.duration.match(/(\d+)/);
          return total + (durationMatch ? parseInt(durationMatch[1]) : 0);
        }, 0);

        const averagePerformance =
          completedSessions.length > 0
            ? completedSessions.reduce(
                (sum, session) => sum + session.performance,
                0
              ) / completedSessions.length
            : 0;

        const successRate =
          studentSessions.length > 0
            ? Math.round(
                (completedSessions.length / studentSessions.length) * 100
              )
            : 0;

        const lastTraining = studentSessions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        return {
          studentId: student.id,
          studentName: student.name,
          totalTrainings: studentSessions.length,
          completedTrainings: completedSessions.length,
          averagePerformance: Math.round(averagePerformance),
          successRate,
          lastTrainingDate: lastTraining?.date || "Не має",
          totalTrainingTime,
        };
      });

      // Загальна статистика
      const totalCompletedTrainings = trainingPlans.filter(
        (plan) => plan.completed
      ).length;
      const totalUpcomingTrainings = trainingPlans.filter(
        (plan) => !plan.completed
      ).length;

      const totalTrainingTime = (trainingSessions || [])
        .filter((session) => session.completed)
        .reduce((total, session) => {
          const durationMatch = session.duration.match(/(\d+)/);
          return total + (durationMatch ? parseInt(durationMatch[1]) : 0);
        }, 0);

      const overallAveragePerformance =
        studentsStats.length > 0
          ? studentsStats.reduce(
              (sum, student) => sum + student.averagePerformance,
              0
            ) / studentsStats.length
          : 0;

      const overallSuccessRate =
        (trainingSessions || []).length > 0
          ? Math.round(
              ((trainingSessions || []).filter((s) => s.completed).length /
                (trainingSessions || []).length) *
                100
            )
          : 0;

      const activeStudents = studentsStats.filter(
        (student) => student.completedTrainings > 0
      ).length;

      // Топ учнів
      const topStudents = studentsStats
        .filter((student) => student.completedTrainings > 0)
        .sort((a, b) => b.averagePerformance - a.averagePerformance)
        .slice(0, 3);

      // Остання активність
      const recentActivity = (trainingSessions || [])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      // Майбутні тренування
      const upcomingTrainings = trainingPlans
        .filter((plan) => !plan.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      const statisticsData: CoachStatistics = {
        overview: {
          totalStudents: students.length,
          activeStudents,
          totalTrainings: trainingPlans.length,
          completedTrainings: totalCompletedTrainings,
          totalTrainingTime,
          averagePerformance: Math.round(overallAveragePerformance),
          successRate: overallSuccessRate,
          upcomingTrainings: totalUpcomingTrainings,
        },
        studentsStats,
        topStudents,
        recentActivity,
        upcomingTrainings,
        trainingSessions: trainingSessions || [],
        trainingPlans: trainingPlans || [],
      };

      console.log("Фінальна статистика тренера:", statisticsData.overview);
      setStatistics(statisticsData);
    } catch (error) {
      console.error("Помилка завантаження статистики тренера:", error);
      setError(error instanceof Error ? error.message : "Невідома помилка");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Не має") return "Не має";
    try {
      return new Date(dateString).toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return "0 хв";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} год ${mins} хв` : `${mins} хв`;
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 70) return "text-yellow-600";
    if (performance >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getPerformanceBgColor = (performance: number) => {
    if (performance >= 90) return "bg-green-100 text-green-800";
    if (performance >= 70) return "bg-yellow-100 text-yellow-800";
    if (performance >= 50) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getIntensityText = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "Висока";
      case "medium":
        return "Середня";
      case "low":
        return "Низька";
      default:
        return "Не вказано";
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && session.user?.role !== "coach") {
      router.push("/dashboard");
    }
  }, [status, router, session]);

  useEffect(() => {
    if (status === "authenticated" && session.user?.role === "coach") {
      fetchCoachStatistics();
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Завантаження статистики тренера...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Помилка: {error}</p>
          <button
            onClick={fetchCoachStatistics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Не вдалося завантажити статистику</p>
        </div>
      </div>
    );
  }

  const {
    overview,
    studentsStats = [],
    topStudents = [],
    recentActivity = [],
    upcomingTrainings = [],
    trainingSessions = [],
    trainingPlans = [],
  } = statistics;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/coach-dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-lg">←</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Статистика тренера
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
                <p className="text-sm text-gray-500">Тренер</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Загальна статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {overview.totalStudents}
            </div>
            <div className="text-sm text-gray-600">Всього учнів</div>
            <div className="text-xs text-gray-400 mt-1">
              {overview.activeStudents} активних
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {overview.completedTrainings}/{overview.totalTrainings}
            </div>
            <div className="text-sm text-gray-600">Тренування</div>
            <div className="text-xs text-gray-400 mt-1">Завершено / Всього</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {overview.successRate}%
            </div>
            <div className="text-sm text-gray-600">Успішність</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {overview.averagePerformance}%
            </div>
            <div className="text-sm text-gray-600">Середня продуктивність</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Топ учнів */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  🏆 Топ учні
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topStudents.length > 0 ? (
                    topStudents.map((student, index) => (
                      <div
                        key={student.studentId}
                        className="flex items-center space-x-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {student.studentName}
                          </h3>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{student.averagePerformance}%</span>
                            <span>{student.completedTrainings} трен.</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Немає даних про учнів
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Остання активність */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  📈 Остання активність
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">⚽</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {session.user?.name || "Учень"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(session.date)} • {session.duration}
                            </p>
                            {session.trainingPlan && (
                              <p className="text-xs text-gray-500">
                                {session.trainingPlan.title}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`font-semibold ${getPerformanceColor(
                              session.performance
                            )}`}
                          >
                            {session.performance}%
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPerformanceBgColor(
                              session.performance
                            )}`}
                          >
                            {session.completed ? "Завершено" : "В процесі"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Немає активності для відображення
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Майбутні тренування */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              📅 Майбутні тренування
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTrainings.length > 0 ? (
                upcomingTrainings.map((training) => (
                  <div
                    key={training.id}
                    className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {training.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Дата:</span>
                        <span className="font-medium">
                          {formatDate(training.date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Тривалість:</span>
                        <span>{training.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Інтенсивність:</span>
                        <span
                          className={`font-medium ${getIntensityColor(
                            training.intensity
                          )}`}
                        >
                          {getIntensityText(training.intensity)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Учні:</span>
                        <span>{training.assignedTo.length}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-gray-500">
                  Немає майбутніх тренувань
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ОСТАННІЙ БЛОК: Детальна статистика з використанням training-sessions та training-plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Детальна інформація про сесії тренувань */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                📋 Останні сесії тренувань
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {trainingSessions.slice(0, 8).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          session.completed ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {session.user?.name || "Учень"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(session.date)} • {session.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${getPerformanceColor(
                          session.performance
                        )}`}
                      >
                        {session.performance}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.completed ? "Завершено" : "В процесі"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {trainingSessions.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Немає сесій тренувань
                </div>
              )}
            </div>
          </div>

          {/* Статистика планів тренувань */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                📊 Статистика планів тренувань
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Всього планів:</span>
                  <span className="font-bold text-blue-600">
                    {trainingPlans.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Завершені плани:</span>
                  <span className="font-bold text-green-600">
                    {trainingPlans.filter((p) => p.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700">Активні плани:</span>
                  <span className="font-bold text-yellow-600">
                    {trainingPlans.filter((p) => !p.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">
                    Середня кількість учнів:
                  </span>
                  <span className="font-bold text-purple-600">
                    {trainingPlans.length > 0
                      ? Math.round(
                          trainingPlans.reduce(
                            (sum, plan) => sum + plan.assignedTo.length,
                            0
                          ) / trainingPlans.length
                        )
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Детальна статистика всіх учнів */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              👥 Детальна статистика учнів
            </h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Учень
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Призначені тренування
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Завершені плани
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Успішність
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Продуктивність
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Активні плани
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Останній план
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentsStats.map((student) => {
                    // Отримуємо плани тренувань для поточного учня
                    const studentPlans = trainingPlans.filter((plan) =>
                      plan.assignedTo.includes(student.studentId)
                    );
                    const completedPlans = studentPlans.filter(
                      (plan) => plan.completed
                    );
                    const activePlans = studentPlans.filter(
                      (plan) => !plan.completed
                    );
                    const recentPlan = studentPlans.sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )[0];

                    // Розраховуємо середню продуктивність з завершених планів
                    const completedPlanPerformance =
                      completedPlans.length > 0
                        ? Math.round(
                            completedPlans.reduce((sum, plan) => {
                              // Знаходимо сесії для цього плану та учня
                              const planSessions = trainingSessions.filter(
                                (session) =>
                                  session.trainingPlanId === plan.id &&
                                  session.userId === student.studentId
                              );
                              const avgSessionPerformance =
                                planSessions.length > 0
                                  ? planSessions.reduce(
                                      (sessionSum, session) =>
                                        sessionSum + session.performance,
                                      0
                                    ) / planSessions.length
                                  : 0;
                              return sum + avgSessionPerformance;
                            }, 0) / completedPlans.length
                          )
                        : 0;

                    return (
                      <tr
                        key={student.studentId}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {student.studentName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div>{student.studentName}</div>
                              <div className="text-xs text-gray-500">
                                {studentPlans.length}{" "}
                                {studentPlans.length === 1 ? "план" : "планів"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-blue-600">
                            {studentPlans.length}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-green-600">
                            {completedPlans.length}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col items-center space-y-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.successRate >= 80
                                  ? "bg-green-100 text-green-800"
                                  : student.successRate >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.successRate}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${student.successRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col items-center space-y-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                completedPlanPerformance >= 80
                                  ? "bg-green-100 text-green-800"
                                  : completedPlanPerformance >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {completedPlanPerformance}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                style={{
                                  width: `${completedPlanPerformance}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-semibold ${
                              activePlans.length > 0
                                ? "text-orange-600"
                                : "text-gray-400"
                            }`}
                          >
                            {activePlans.length}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-sm text-gray-600">
                          {recentPlan ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {recentPlan.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(recentPlan.date)}
                              </div>
                              <div
                                className={`text-xs px-1 py-0.5 rounded ${
                                  recentPlan.completed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {recentPlan.completed
                                  ? "Завершено"
                                  : "Активний"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Не має</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  completedPlans.length > 0
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                              <span className="text-xs text-gray-600">
                                {completedPlans.length} завершених
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  activePlans.length > 0
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                              <span className="text-xs text-gray-600">
                                {activePlans.length} активних
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  studentPlans.length > 0
                                    ? "bg-purple-500"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                              <span className="text-xs text-gray-600">
                                {studentPlans.length} всього
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Додаткова інформація про плани тренувань */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    Загальна кількість планів
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {trainingPlans.length}
                  </span>
                </div>
                <div className="mt-2 text-xs text-blue-700">
                  Усі створені плани тренувань
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">
                    Завершені плани
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {trainingPlans.filter((p) => p.completed).length}
                  </span>
                </div>
                <div className="mt-2 text-xs text-green-700">
                  {trainingPlans.length > 0
                    ? Math.round(
                        (trainingPlans.filter((p) => p.completed).length /
                          trainingPlans.length) *
                          100
                      )
                    : 0}
                  % від загальної кількості
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-900">
                    Активні плани
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {trainingPlans.filter((p) => !p.completed).length}
                  </span>
                </div>
                <div className="mt-2 text-xs text-orange-700">
                  Плани в процесі виконання
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900">
                    Середня кількість учнів
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    {trainingPlans.length > 0
                      ? Math.round(
                          trainingPlans.reduce(
                            (sum, plan) => sum + plan.assignedTo.length,
                            0
                          ) / trainingPlans.length
                        )
                      : 0}
                  </span>
                </div>
                <div className="mt-2 text-xs text-purple-700">
                  На план тренування
                </div>
              </div>
            </div>

            {/* Детальний список останніх планів тренувань */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Останні плани тренувань
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingPlans.slice(0, 6).map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-gray-50 rounded-lg p-4 border"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1 pr-2">
                        {plan.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          plan.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {plan.completed ? "Завершено" : "Активний"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Дата:</span>
                        <span className="font-medium">
                          {formatDate(plan.date)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Тривалість:</span>
                        <span>{plan.duration}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Інтенсивність:</span>
                        <span
                          className={`font-medium ${getIntensityColor(
                            plan.intensity
                          )}`}
                        >
                          {getIntensityText(plan.intensity)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Учні:</span>
                        <span className="font-medium text-blue-600">
                          {plan.assignedTo.length}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Вправи:</span>
                        <span className="font-medium">
                          {plan.exercises.length}
                        </span>
                      </div>
                    </div>

                    {plan.completed && plan.completedDate && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-green-600 font-medium">
                          Завершено: {formatDate(plan.completedDate)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {trainingPlans.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    Немає планів тренувань для відображення
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
