"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TrainingPlan {
  id: number;
  title: string;
  duration: string;
  intensity: "low" | "medium" | "high";
  completed: boolean;
  exercises: string[];
  assignedTo: string[];
  date: string;
  completedDate?: string;
}

export default function ArchivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [intensityFilter, setIntensityFilter] = useState("all");
  const trainingsPerPage = 10;

  const fetchTrainingPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error("Користувач не авторизований");
      }

      const userId = session.user.id;

      const trainingPlansRes = await fetch("http://localhost:3001/trainingPlans");
      const allTrainingPlans = await trainingPlansRes.json();
      const userTrainingPlans = allTrainingPlans.filter((plan: TrainingPlan) =>
        plan.assignedTo.includes(userId) && plan.completed
      );

      setTrainingPlans(userTrainingPlans);
    } catch (err) {
      console.error("Помилка завантаження тренувань:", err);
      setError("Не вдалося завантажити тренування. Спробуйте пізніше.");
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
      fetchTrainingPlans();
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
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
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

  // Фільтрація та пошук
  const filteredTrainings = trainingPlans.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.exercises.some(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIntensity = intensityFilter === "all" || training.intensity === intensityFilter;
    
    return matchesSearch && matchesIntensity;
  });

  // Сортування за датою (новіші зверху)
  const sortedTrainings = [...filteredTrainings].sort((a, b) => 
    new Date(b.completedDate || b.date).getTime() - new Date(a.completedDate || a.date).getTime()
  );

  // Пагінація
  const startIndex = (currentPage - 1) * trainingsPerPage;
  const endIndex = startIndex + trainingsPerPage;
  const paginatedTrainings = sortedTrainings.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedTrainings.length / trainingsPerPage);

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

  if (!session) {
    return null;
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
              <h1 className="text-2xl font-bold text-gray-900">
                📚 Повний архів тренувань
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name}
                </p>
                <p className="text-sm text-gray-500">Учень</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                {session.user?.name?.charAt(0) || "У"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Загальна статистика */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{trainingPlans.length}</div>
              <div className="text-sm text-gray-600">Всього тренувань</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {trainingPlans.filter(t => t.intensity === "low").length}
              </div>
              <div className="text-sm text-gray-600">Низької інтенсивності</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {trainingPlans.filter(t => t.intensity === "medium").length}
              </div>
              <div className="text-sm text-gray-600">Середньої інтенсивності</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {trainingPlans.filter(t => t.intensity === "high").length}
              </div>
              <div className="text-sm text-gray-600">Високої інтенсивності</div>
            </div>
          </div>
        </div>

        {/* Фільтри та пошук */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Пошук за назвою або вправами..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={intensityFilter}
              onChange={(e) => setIntensityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Вся інтенсивність</option>
              <option value="low">Низька</option>
              <option value="medium">Середня</option>
              <option value="high">Висока</option>
            </select>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Знайдено {filteredTrainings.length} тренувань
          </div>
        </div>

        {/* Список тренувань */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Всі завершені тренування
            </h2>
          </div>

          {paginatedTrainings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Тренування не знайдено
              </h3>
              <p className="text-gray-600">
                Спробуйте змінити параметри пошуку або фільтрації
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {paginatedTrainings.map((training) => (
                  <div key={training.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getIntensityColor(training.intensity)}`}></div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {training.title}
                          </h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            Завершено
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <span>⏱️ {training.duration}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getIntensityColor(training.intensity)} text-white`}>
                              {getIntensityText(training.intensity)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>📅 {formatDate(training.completedDate || training.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>🔢 {training.exercises.length} вправ</span>
                          </div>
                        </div>

                        {training.exercises && training.exercises.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Вправи:</h4>
                            <div className="flex flex-wrap gap-2">
                              {training.exercises.map((exercise, index) => (
                                <span
                                  key={index}
                                  className="bg-green-50 text-green-700 px-3 py-1 rounded text-sm border border-green-200"
                                >
                                  {exercise}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Пагінація */}
              {totalPages > 1 && (
                <div className="p-6 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Сторінка {currentPage} з {totalPages} • 
                      Показано {paginatedTrainings.length} з {filteredTrainings.length} тренувань
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Попередня
                      </button>
                      
                      <span className="px-3 py-2 text-sm text-gray-600">
                        {currentPage} / {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Наступна
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}