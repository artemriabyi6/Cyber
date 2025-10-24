// app/students/[id]/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  createdAt: string;
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
}

interface TrainingSession {
  id: string;
  trainingPlanId: string;
  userId: string;
  date: string;
  duration: string;
  performance: number;
  coachNotes: string;
  completed: boolean;
}

interface ProgressStat {
  id: string;
  userId: string;
  skill: string;
  current: number;
  previous: number;
  icon: string;
}

interface NextTraining {
  id: string;
  userId: string;
  date: string;
  time: string;
  type: string;
  focus: string;
  trainingPlanId?: string;
}

interface StudentData {
  user: User | null;
  trainingPlans: TrainingPlan[];
  trainingSessions: TrainingSession[];
  progressStats: ProgressStat[];
  nextTraining: NextTraining | null;
}

// Додаємо інтерфейси для API відповідей
interface ApiTrainingPlan {
  id: string;
  title: string;
  duration: string;
  intensity: string;
  completed: boolean;
  exercises: string[];
  assignedTo: string[];
  date: string;
  completedDate?: string;
}

interface ApiTrainingSession {
  id: string;
  trainingPlanId: string;
  userId: string;
  date: string;
  duration: string;
  performance: number;
  coachNotes: string;
  completed: boolean;
}

interface ApiProgressStat {
  id: string;
  userId: string;
  skill: string;
  current: number;
  previous: number;
  icon: string;
}

interface ApiNextTraining {
  id: string;
  userId: string;
  date: string;
  time: string;
  type: string;
  focus: string;
  trainingPlanId?: string;
}

export default function StudentProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [studentData, setStudentData] = useState<StudentData>({
    user: null,
    trainingPlans: [],
    trainingSessions: [],
    progressStats: [],
    nextTraining: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const studentId = params.id as string;

    // Використовуємо наші API endpoints
    const [userRes, trainingPlansRes, sessionsRes, statsRes, nextTrainingsRes] = await Promise.all([
      fetch(`/api/users/students/${studentId}`),
      fetch('/api/training-plans'),
      fetch('/api/training-sessions'),
      fetch('/api/progress-stats'),
      fetch('/api/next-trainings')
    ]);

    if (!userRes.ok) throw new Error('Не вдалося завантажити дані учня');
    
    const userData: User = await userRes.json();
    
    // Отримуємо дані тільки для цього учня
    const trainingPlansData: ApiTrainingPlan[] = trainingPlansRes.ok ? await trainingPlansRes.json() : [];
    const studentTrainingPlans = trainingPlansData.filter((plan: ApiTrainingPlan) => 
      plan.assignedTo.includes(studentId)
    );

    const sessionsData: ApiTrainingSession[] = sessionsRes.ok ? await sessionsRes.json() : [];
    const studentSessions = sessionsData.filter((session: ApiTrainingSession) => 
      session.userId === studentId
    );

    const statsData: ApiProgressStat[] = statsRes.ok ? await statsRes.json() : [];
    const studentStats = statsData.filter((stat: ApiProgressStat) => 
      stat.userId === studentId
    );

    const nextTrainingsData: ApiNextTraining[] = nextTrainingsRes.ok ? await nextTrainingsRes.json() : [];
    const studentNextTraining = nextTrainingsData.find((training: ApiNextTraining) => 
      training.userId === studentId
    );

    setStudentData({
      user: userData,
      trainingPlans: studentTrainingPlans,
      trainingSessions: studentSessions,
      progressStats: studentStats,
      nextTraining: studentNextTraining || null
    });

  } catch (err) {
    console.error('Помилка завантаження даних:', err);
    setError('Не вдалося завантажити дані учня');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      if (session.user?.role !== "coach") {
        router.push("/dashboard");
        return;
      }
      fetchStudentData();
    }
  }, [status, session, params.id]);

  // Функція для форматування дати
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження профілю учня...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "coach") {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">😔</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudentData}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  const { user, trainingPlans, trainingSessions, progressStats, nextTraining } = studentData;

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Учня не знайдено</p>
        </div>
      </div>
    );
  }

  const completedTrainings = trainingSessions.filter(session => session.completed);
  const upcomingTrainings = trainingPlans.filter(plan => !plan.completed);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100">
      {/* Header */}
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
                👨‍🎓 Профіль учня
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name}
                </p>
                <p className="text-sm text-gray-500">Тренер</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Інформація про учня */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Зареєстровано: {formatDate(user.createdAt)}
              </p>
            </div>
            {nextTraining && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium text-green-800">Наступне тренування</p>
                <p className="text-sm text-green-600">
                  {formatDate(nextTraining.date)} о {nextTraining.time}
                </p>
                <p className="text-sm text-green-600">{nextTraining.type}</p>
              </div>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{trainingPlans.length}</div>
            <div className="text-sm text-gray-600">Всього тренувань</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{completedTrainings.length}</div>
            <div className="text-sm text-gray-600">Завершених</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{upcomingTrainings.length}</div>
            <div className="text-sm text-gray-600">Майбутніх</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {completedTrainings.length > 0 
                ? Math.round(completedTrainings.reduce((acc, session) => acc + session.performance, 0) / completedTrainings.length)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Середній результат</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Прогрес навичок */}
          {progressStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Прогрес навичок</h3>
              <div className="space-y-4">
                {progressStats.map((stat) => {
                  const improvement = stat.current - stat.previous;
                  return (
                    <div key={stat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{stat.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{stat.skill}</p>
                          <p className={`text-sm ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {improvement >= 0 ? '+' : ''}{improvement} пунктів
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{stat.current}%</p>
                        <p className="text-sm text-gray-500">з {stat.previous}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Останні тренування */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏃 Останні тренування</h3>
            <div className="space-y-3">
              {trainingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(session.date)}
                    </p>
                    <p className="text-sm text-gray-600">{session.duration}</p>
                  </div>
                  <span className={`font-semibold ${
                    session.performance >= 90 ? 'text-green-600' :
                    session.performance >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {session.performance}%
                  </span>
                </div>
              ))}
              {trainingSessions.length === 0 && (
                <p className="text-gray-500 text-center py-4">Ще немає тренувань</p>
              )}
            </div>
          </div>
        </div>

        {/* Майбутні тренування */}
        {upcomingTrainings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Майбутні тренування</h3>
            <div className="space-y-4">
              {upcomingTrainings.map((training) => (
                <div key={training.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">
                    {training.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>⏱️ {training.duration}</span>
                    <span>⚡ {training.intensity}</span>
                    <span>📅 {formatDate(training.date)}</span>
                  </div>
                  {training.exercises.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 mb-1 text-sm">Вправи:</p>
                      <div className="flex flex-wrap gap-2">
                        {training.exercises.map((exercise, index) => (
                          <span
                            key={index}
                            className="bg-white text-orange-700 px-2 py-1 rounded text-xs border border-orange-200"
                          >
                            {exercise}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}