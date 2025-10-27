// app/archive/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TrainingPlan {
  id: string;
  title: string;
  duration: string;
  intensity: "low" | "medium" | "high";
  completed: boolean;
  exercises: string[];
  assignedTo: string[];
  date: string;
  completedDate?: string;
}

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
  createdBy: string;
}

export default function ArchivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const trainingsPerPage = 10;

  const fetchArchiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error("Користувач не авторизований");
      }

      const response = await fetch('/api/training-plans');
      
      if (!response.ok) {
        throw new Error('Не вдалося завантажити дані тренувань');
      }

      const trainingPlansData: ApiTrainingPlan[] = await response.json();

      console.log('Отримані дані з API:', trainingPlansData);

      // Трансформуємо дані для сумісності з інтерфейсом
      const transformedTrainingPlans: TrainingPlan[] = trainingPlansData
        .filter(plan => plan.completed) // Тільки завершені тренування
        .map((plan: ApiTrainingPlan) => {
          console.log('Обробляємо план:', plan.id, 'вправи:', plan.exercises);
          
          return {
            id: plan.id,
            title: plan.title || `Тренування ${plan.date}`,
            duration: plan.duration,
            intensity: (plan.intensity as "low" | "medium" | "high") || "medium",
            completed: plan.completed,
            exercises: Array.isArray(plan.exercises) ? plan.exercises : [], // ВИПРАВЛЕННЯ: використовуємо exercises з плану
            assignedTo: plan.assignedTo || [],
            date: plan.date,
            completedDate: plan.completedDate,
          };
        });

      console.log('Трансформовані плани:', transformedTrainingPlans);

      setTrainingPlans(transformedTrainingPlans);
    } catch (err) {
      console.error("Помилка завантаження архіву:", err);
      setError("Не вдалося завантажити архів. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      if (session.user?.role === "coach") {
        router.push("/coach-dashboard");
        return;
      }
      fetchArchiveData();
    }
  }, [status, session, router]);

  // Функція для форматування дати
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Функція для отримання кольору інтенсивності
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  // Функція для отримання тексту інтенсивності
  const getIntensityText = (intensity: string) => {
    switch (intensity) {
      case "high": return "Висока";
      case "medium": return "Середня";
      case "low": return "Низька";
      default: return "Не вказано";
    }
  };

  // Фільтрація та сортування
  const filteredAndSortedTrainings = trainingPlans
    .filter(training => {
      if (filter === "high") return training.intensity === "high";
      if (filter === "medium") return training.intensity === "medium";
      if (filter === "low") return training.intensity === "low";
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.completedDate || b.date).getTime() - new Date(a.completedDate || a.date).getTime();
        case "date-asc":
          return new Date(a.completedDate || a.date).getTime() - new Date(b.completedDate || b.date).getTime();
        case "duration-desc":
          return parseInt(b.duration) - parseInt(a.duration);
        case "duration-asc":
          return parseInt(a.duration) - parseInt(b.duration);
        default:
          return 0;
      }
    });

  // Пагінація
  const totalPages = Math.ceil(filteredAndSortedTrainings.length / trainingsPerPage);
  const startIndex = (currentPage - 1) * trainingsPerPage;
  const endIndex = startIndex + trainingsPerPage;
  const paginatedTrainings = filteredAndSortedTrainings.slice(startIndex, endIndex);

  // Статистика
  const totalTrainings = trainingPlans.length;
  const highIntensityCount = trainingPlans.filter(t => t.intensity === "high").length;
  const mediumIntensityCount = trainingPlans.filter(t => t.intensity === "medium").length;
  const lowIntensityCount = trainingPlans.filter(t => t.intensity === "low").length;
  const totalExercises = new Set(trainingPlans.flatMap(t => t.exercises)).size;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження архіву...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">😔</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchArchiveData}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-lg">←</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">📚 Архів тренувань</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
                <p className="text-sm text-gray-500">Учень</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Загальна статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTrainings}</div>
            <div className="text-sm text-gray-600">Всього тренувань</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{highIntensityCount}</div>
            <div className="text-sm text-gray-600">Високої інтенсивності</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{mediumIntensityCount}</div>
            <div className="text-sm text-gray-600">Середньої інтенсивності</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{lowIntensityCount}</div>
            <div className="text-sm text-gray-600">Низької інтенсивності</div>
          </div>
        </div>

        {/* Фільтри та сортування */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фільтр за інтенсивністю:
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Всі тренування</option>
                  <option value="high">Висока інтенсивність</option>
                  <option value="medium">Середня інтенсивність</option>
                  <option value="low">Низька інтенсивність</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сортування:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="date-desc">Дата (новіші)</option>
                  <option value="date-asc">Дата (старіші)</option>
                  <option value="duration-desc">Тривалість (більше)</option>
                  <option value="duration-asc">Тривалість (менше)</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Показано {paginatedTrainings.length} з {filteredAndSortedTrainings.length} тренувань
            </div>
          </div>
        </div>

        {/* Список тренувань */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Завершені тренування ({filteredAndSortedTrainings.length})
            </h2>
          </div>

          <div className="p-6">
            {paginatedTrainings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Тренувань не знайдено
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === "all" 
                    ? "У вас ще немає завершених тренувань"
                    : "Немає тренувань з обраною інтенсивністю"
                  }
                </p>
                {filter !== "all" && (
                  <button
                    onClick={() => setFilter("all")}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                  >
                    Показати всі тренування
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedTrainings.map((training) => (
                  <div
                    key={training.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className={`w-3 h-3 rounded-full ${getIntensityColor(training.intensity)}`}
                          ></div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {training.title}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">⏱️</span>
                            <span>{training.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">⚡</span>
                            <span className={getIntensityColor(training.intensity)}>
                              {getIntensityText(training.intensity)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">📅</span>
                            <span>{formatDate(training.completedDate || training.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">✅</span>
                            <span className="text-green-600 font-medium">Завершено</span>
                          </div>
                        </div>

                        {training.exercises && training.exercises.length > 0 ? (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">
                              Виконані вправи:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {training.exercises.map((exercise, index) => (
                                <span
                                  key={index}
                                  className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm border border-green-200"
                                >
                                  {exercise}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            Вправи не вказані
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col gap-2 lg:justify-center items-center">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Завершено
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Пагінація */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Попередня
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-green-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Наступна →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Додаткова інформація */}
        {trainingPlans.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📊 Загальна статистика архіву
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalTrainings}</div>
                <div className="text-sm text-blue-800">Всього тренувань</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalExercises}</div>
                <div className="text-sm text-green-800">Унікальних вправ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((trainingPlans.filter(t => t.intensity === "high").length / totalTrainings) * 100)}%
                </div>
                <div className="text-sm text-purple-800">Високої інтенсивності</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {trainingPlans.length > 0 
                    ? Math.round(trainingPlans.reduce((sum, t) => sum + parseInt(t.duration), 0) / trainingPlans.length)
                    : 0
                  } хв
                </div>
                <div className="text-sm text-orange-800">Середня тривалість</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}