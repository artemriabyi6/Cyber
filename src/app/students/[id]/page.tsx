"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface TrainingPlan {
  id: string;
  title: string;
  duration: string;
  intensity: string;
  completed: boolean;
  exercises: string[];
  assignedTo: string[];
  createdBy: string;
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

export default function StudentProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<User | null>(null);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStat[]>([]);
  const [nextTraining, setNextTraining] = useState<NextTraining | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchStudentData();
    }
  }, [status, studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        studentRes,
        trainingPlansRes,
        sessionsRes,
        progressRes,
        nextTrainingRes
      ] = await Promise.all([
        fetch(`http://localhost:3001/users/${studentId}`),
        fetch("http://localhost:3001/trainingPlans"),
        fetch("http://localhost:3001/trainingSessions"),
        fetch("http://localhost:3001/progressStats"),
        fetch("http://localhost:3001/nextTrainings")
      ]);

      if (!studentRes.ok) {
        throw new Error("Учень не знайдений");
      }

      const studentData = await studentRes.json();
      const trainingPlansData = await trainingPlansRes.json();
      const sessionsData = await sessionsRes.json();
      const progressData = await progressRes.json();
      const nextTrainingsData = await nextTrainingRes.json();

      // Фільтруємо дані для поточного учня
      const studentTrainingPlans = trainingPlansData.filter((plan: TrainingPlan) =>
        plan.assignedTo.includes(studentId)
      );

      const studentSessions = sessionsData.filter((session: TrainingSession) =>
        session.userId === studentId
      );

      const studentProgress = progressData.filter((stat: ProgressStat) =>
        stat.userId === studentId
      );

      const studentNextTraining = nextTrainingsData.find((nt: NextTraining) =>
        nt.userId === studentId
      );

      setStudent(studentData);
      setTrainingPlans(studentTrainingPlans);
      setTrainingSessions(studentSessions);
      setProgressStats(studentProgress);
      setNextTraining(studentNextTraining || null);

    } catch (error) {
      console.error("Помилка завантаження даних:", error);
      setError(error instanceof Error ? error.message : "Невідома помилка");
    } finally {
      setLoading(false);
    }
  };

  // Статистика для учня
  const studentStats = {
    totalTrainings: trainingPlans.length,
    completedTrainings: trainingPlans.filter(plan => plan.completed).length,
    upcomingTrainings: trainingPlans.filter(plan => !plan.completed).length,
    averagePerformance: trainingSessions.length > 0 
      ? trainingSessions.reduce((acc, session) => acc + session.performance, 0) / trainingSessions.length
      : 0,
    totalTrainingTime: trainingSessions.reduce((acc, session) => acc + parseInt(session.duration), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження профілю учня...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Помилка</h2>
            <p className="text-red-600 mb-4">{error || "Учень не знайдений"}</p>
            <button
              onClick={() => router.back()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Назад
              </button>
              <h1 className="text-2xl font-bold text-gray-900">👨‍🎓 Профіль учня</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user?.role === "coach" && (
                <button
                  onClick={() => router.push("/coach-dashboard")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Панель тренера
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Header */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                {student.name.charAt(0)}
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h1>
              <p className="text-gray-600 text-lg mb-4">{student.email}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{studentStats.totalTrainings}</div>
                  <div className="text-sm text-gray-600">Тренувань</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{studentStats.completedTrainings}</div>
                  <div className="text-sm text-gray-600">Завершено</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{studentStats.upcomingTrainings}</div>
                  <div className="text-sm text-gray-600">Майбутні</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{studentStats.averagePerformance.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Успішність</div>
                </div>
              </div>

              {/* Next Training Badge */}
              {nextTraining && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">📅</span>
                    <div>
                      <p className="font-semibold text-green-800">Наступне тренування</p>
                      <p className="text-sm text-green-600">
                        {nextTraining.date} о {nextTraining.time} • {nextTraining.type}
                      </p>
                      {nextTraining.focus && (
                        <p className="text-xs text-green-500">Фокус: {nextTraining.focus}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="flex border-b">
            {["overview", "trainings", "progress", "stats"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "overview" && "Огляд"}
                {tab === "trainings" && "Тренування"}
                {tab === "progress" && "Прогрес"}
                {tab === "stats" && "Статистика"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Остання активність</h3>
                  <div className="space-y-3">
                    {trainingSessions.slice(0, 5).map((session) => {
                      const training = trainingPlans.find(t => t.id === session.trainingPlanId);
                      return (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{training?.title || "Невідоме тренування"}</p>
                            <p className="text-sm text-gray-600">{session.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              {session.performance}%
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{session.duration} хв</p>
                          </div>
                        </div>
                      );
                    })}
                    {trainingSessions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Ще немає активності</p>
                    )}
                  </div>
                </div>

                {/* Skills Progress */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Прогрес навичок</h3>
                  <div className="space-y-4">
                    {progressStats.map((stat) => (
                      <div key={stat.id} className="bg-white border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{stat.icon}</span>
                            <span className="font-medium">{stat.skill}</span>
                          </div>
                          <span className="font-bold text-blue-600">{stat.current}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stat.current}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Минулий: {stat.previous}%</span>
                          <span className="text-green-600">
                            +{stat.current - stat.previous}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {progressStats.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Немає даних про прогрес</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Trainings Tab */}
            {activeTab === "trainings" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">
                  Усі тренування ({trainingPlans.length})
                </h3>
                <div className="space-y-4">
                  {trainingPlans.map((training) => (
                    <div key={training.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{training.title}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>⏱️ {training.duration}</span>
                            <span>⚡ {training.intensity}</span>
                            <span>📅 {training.date}</span>
                            <span className={`px-2 py-1 rounded ${
                              training.completed 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {training.completed ? "Завершено" : "Заплановано"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {training.exercises.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Вправи:</h5>
                          <div className="flex flex-wrap gap-2">
                            {training.exercises.map((exercise, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                                {exercise}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {training.completedDate && (
                        <div className="text-sm text-gray-500">
                          Завершено: {training.completedDate}
                        </div>
                      )}
                    </div>
                  ))}
                  {trainingPlans.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Ще немає тренувань</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === "progress" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Детальний прогрес</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {progressStats.map((stat) => (
                    <div key={stat.id} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 text-center">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <h4 className="font-semibold text-gray-900 mb-2">{stat.skill}</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{stat.current}%</div>
                      <div className="w-full bg-white rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${stat.current}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Попередній: {stat.previous}% 
                        <span className="text-green-600 ml-2">
                          (+{stat.current - stat.previous}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  {progressStats.length === 0 && (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-gray-500">Немає даних про прогрес</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Статистика</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Training Statistics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Статистика тренувань</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Загальна кількість тренувань:</span>
                        <span className="font-bold">{studentStats.totalTrainings}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Завершено тренувань:</span>
                        <span className="font-bold text-green-600">{studentStats.completedTrainings}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Майбутні тренування:</span>
                        <span className="font-bold text-yellow-600">{studentStats.upcomingTrainings}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Загальний час тренувань:</span>
                        <span className="font-bold">{studentStats.totalTrainingTime} хв</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Statistics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Показники ефективності</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Середня успішність:</span>
                        <span className="font-bold text-purple-600">{studentStats.averagePerformance.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Рівень відвідуваності:</span>
                        <span className="font-bold text-blue-600">
                          {studentStats.totalTrainings > 0 
                            ? Math.round((studentStats.completedTrainings / studentStats.totalTrainings) * 100)
                            : 0}%
                        </span>
                      </div>
                      {nextTraining && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-800">Наступне тренування</p>
                          <p className="text-xs text-blue-600">
                            {nextTraining.date} о {nextTraining.time}
                          </p>
                          <p className="text-xs text-blue-600">{nextTraining.type}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}