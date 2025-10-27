"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Інтерфейси для даних
interface TrainingSession {
  id: string;
  title: string;
  duration: string;
  intensity: "low" | "medium" | "high";
  completed: boolean;
  exercises: string[];
  assignedTo: string[];
  date: string;
  completedDate?: string;
  performance: number;
  coachNotes: string;
}

interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  status: string;
  deadline?: string;
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

interface StatisticsData {
  overview: {
    totalTrainings: number;
    completedTrainings: number;
    totalTrainingTime: number;
    averagePerformance: number;
    totalGoals: number;
    completedGoals: number;
    upcomingTrainings: number;
    successRate: number;
  };
  monthlyStats: {
    month: string;
    trainings: number;
    averagePerformance: number;
    totalDuration: number;
  }[];
  skillProgress: {
    skill: string;
    icon: string;
    current: number;
    previous: number;
    improvement: number;
    improvementPercent: string;
  }[];
  recentTrainings: TrainingSession[];
  goalsProgress: Goal[];
  nextTraining?: NextTraining;
  upcomingTrainings: TrainingSession[];
}

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStatisticsData = async () => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        throw new Error("Користувач не авторизований");
      }

      console.log('Завантаження статистики для userId:', session.user.id);

      // Використовуємо ті ж самі API що й в архіві
      const [trainingPlansRes, goalsRes, nextTrainingsRes] = await Promise.all([
        fetch('/api/training-plans'),
        fetch('/api/goals'),
        fetch('/api/next-trainings')
      ]);

      console.log('Статуси відповідей:', {
        trainingPlans: trainingPlansRes.status,
        goals: goalsRes.status,
        nextTrainings: nextTrainingsRes.status
      });

      if (!trainingPlansRes.ok) {
        throw new Error(`Не вдалося завантажити тренування: ${trainingPlansRes.status}`);
      }

      const trainingPlans: TrainingSession[] = await trainingPlansRes.json();
      const goals: Goal[] = goalsRes.ok ? await goalsRes.json() : [];
      const nextTrainings: NextTraining[] = nextTrainingsRes.ok ? await nextTrainingsRes.json() : [];

      console.log('Отримані дані:', {
        trainingPlansCount: trainingPlans.length,
        trainingPlans: trainingPlans,
        goalsCount: goals.length,
        nextTrainingsCount: nextTrainings.length
      });

      // Розрахунок статистики
      const completedTrainings = trainingPlans.filter(training => training.completed);
      const totalTrainingTime = completedTrainings.reduce((total, training) => {
        const durationMatch = training.duration.match(/(\d+)/);
        return total + (durationMatch ? parseInt(durationMatch[1]) : 0);
      }, 0);

      const averagePerformance = completedTrainings.length > 0 
        ? completedTrainings.reduce((sum, training) => sum + (training.performance || 0), 0) / completedTrainings.length
        : 0;

      const successRate = trainingPlans.length > 0 
        ? Math.round((completedTrainings.length / trainingPlans.length) * 100)
        : 0;

      // Місячна статистика
      const monthlyStats = calculateMonthlyStats(completedTrainings);
      
      // Прогрес навичок (тимчасові дані)
      const skillProgress = calculateSkillProgress(completedTrainings);
      
      // Останні тренування
      const recentTrainings = trainingPlans.slice(0, 5);
      
      // Майбутні тренування
      const upcomingTrainings = trainingPlans.filter(training => !training.completed);

      const statisticsData: StatisticsData = {
        overview: {
          totalTrainings: trainingPlans.length,
          completedTrainings: completedTrainings.length,
          totalTrainingTime,
          averagePerformance: Math.round(averagePerformance),
          totalGoals: goals.length,
          completedGoals: goals.filter(goal => goal.status === 'completed').length,
          upcomingTrainings: upcomingTrainings.length,
          successRate
        },
        monthlyStats,
        skillProgress,
        recentTrainings,
        goalsProgress: goals,
        nextTraining: nextTrainings[0],
        upcomingTrainings
      };

      console.log('Фінальна статистика:', statisticsData.overview);
      setStatistics(statisticsData);
      
    } catch (error) {
      console.error('Помилка завантаження статистики:', error);
      // Створюємо об'єкт з пустими даними при помилці
      const emptyStats: StatisticsData = {
        overview: {
          totalTrainings: 0,
          completedTrainings: 0,
          totalTrainingTime: 0,
          averagePerformance: 0,
          totalGoals: 0,
          completedGoals: 0,
          upcomingTrainings: 0,
          successRate: 0
        },
        monthlyStats: [],
        skillProgress: [],
        recentTrainings: [],
        goalsProgress: [],
        upcomingTrainings: []
      };
      setStatistics(emptyStats);
    } finally {
      setLoading(false);
    }
  };

  // Допоміжні функції для обчислення статистики
  const calculateMonthlyStats = (trainings: TrainingSession[]) => {
    const monthlyData: { [key: string]: { count: number; totalPerformance: number; totalDuration: number } } = {};
    
    trainings.forEach(training => {
      if (training.completedDate || training.date) {
        const date = training.completedDate || training.date;
        const month = date.substring(0, 7); // YYYY-MM
        
        if (!monthlyData[month]) {
          monthlyData[month] = { count: 0, totalPerformance: 0, totalDuration: 0 };
        }
        
        monthlyData[month].count++;
        monthlyData[month].totalPerformance += (training.performance || 0);
        
        // Конвертуємо тривалість в хвилини
        const durationMatch = training.duration.match(/(\d+)/);
        const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 0;
        monthlyData[month].totalDuration += durationMinutes;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      trainings: data.count,
      averagePerformance: data.count > 0 ? Math.round(data.totalPerformance / data.count) : 0,
      totalDuration: data.totalDuration
    })).slice(-6);
  };

  const calculateSkillProgress = (trainings: TrainingSession[]) => {
    // Розраховуємо реальний прогрес на основі тренувань
    const totalPerformance = trainings.reduce((sum, training) => sum + (training.performance || 0), 0);
    const avgPerformance = trainings.length > 0 ? totalPerformance / trainings.length : 0;
    
    // Базові навички з прогрессом на основі загальної продуктивності
    const baseSkills = [
      { skill: 'Дриблінг', icon: '⚽', base: 60 },
      { skill: 'Удар', icon: '🎯', base: 55 },
      { skill: 'Пас', icon: '🔄', base: 65 },
      { skill: 'Фізична форма', icon: '💪', base: 70 }
    ];

    return baseSkills.map(skill => {
      const current = Math.min(skill.base + Math.round((avgPerformance - 50) / 2), 95);
      const previous = Math.max(skill.base - 10, 30);
      const improvement = current - previous;
      const improvementPercent = previous > 0 ? ((improvement / previous) * 100).toFixed(1) : "0.0";

      return {
        skill: skill.skill,
        icon: skill.icon,
        current,
        previous,
        improvement,
        improvementPercent
      };
    });
  };

  const formatMonth = (monthString: string) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return '0 хв';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} год ${mins} хв` : `${mins} хв`;
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 70) return 'text-yellow-600';
    if (performance >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceBgColor = (performance: number) => {
    if (performance >= 90) return 'bg-green-100 text-green-800';
    if (performance >= 70) return 'bg-yellow-100 text-yellow-800';
    if (performance >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getImprovementColor = (improvement: number) => {
    return improvement >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getIntensityText = (intensity: string) => {
    switch (intensity) {
      case "high": return "Висока";
      case "medium": return "Середня";
      case "low": return "Низька";
      default: return "Не вказано";
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
      fetchStatisticsData();
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження статистики...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Не вдалося завантажити статистику</p>
          <button 
            onClick={fetchStatisticsData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  const { 
    overview,
    monthlyStats = [],
    skillProgress = [],
    recentTrainings = [],
    goalsProgress = [],
    nextTraining,
    upcomingTrainings = []
  } = statistics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
              <h1 className="text-2xl font-bold text-gray-900">📈 Моя статистика</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name}
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
            <div className="text-2xl font-bold text-blue-600">{overview.completedTrainings}</div>
            <div className="text-sm text-gray-600">Завершених тренувань</div>
            <div className="text-xs text-gray-400 mt-1">з {overview.totalTrainings}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{overview.averagePerformance}%</div>
            <div className="text-sm text-gray-600">Середній результат</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{overview.successRate}%</div>
            <div className="text-sm text-gray-600">Успішність</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatDuration(overview.totalTrainingTime)}
            </div>
            <div className="text-sm text-gray-600">Загальний час</div>
          </div>
        </div>

        {/* Навігація по вкладках */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Огляд
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'progress'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Мій прогрес
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`flex-1 px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'monthly'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              По місяцях
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'goals'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Мої цілі
            </button>
          </div>

          <div className="p-6">
            {/* Вкладка Огляд */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Графік продуктивності */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Моя продуктивність</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {monthlyStats.length > 0 ? (
                      <div className="flex items-end justify-between h-32">
                        {monthlyStats.map((month, index) => (
                          <div key={month.month} className="flex flex-col items-center flex-1 mx-1">
                            <div
                              className="bg-green-500 rounded-t-lg w-full max-w-12 transition-all duration-500 hover:bg-green-600"
                              style={{ height: `${((month.averagePerformance || 0) / 100) * 80}px` }}
                              title={`${month.averagePerformance || 0}% - ${month.trainings || 0} тренувань`}
                            ></div>
                            <div className="text-xs text-gray-600 mt-2 text-center">
                              {formatMonth(month.month).split(' ')[0]}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Немає даних для відображення
                      </div>
                    )}
                  </div>
                </div>

                {/* Останні тренування */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Мої останні тренування</h3>
                  <div className="space-y-3">
                    {recentTrainings.length > 0 ? (
                      recentTrainings.map((training) => (
                        <div key={training.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">⚽</span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {training.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDate(training.completedDate || training.date)} • {training.duration}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`font-semibold ${getPerformanceColor(training.performance || 0)}`}>
                              {training.performance || 0}%
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${training.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {training.completed ? 'Завершено' : 'В процесі'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Немає тренувань для відображення
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Вкладка Прогрес */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Мій прогрес навичок</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {skillProgress.length > 0 ? (
                    skillProgress.map((skill) => (
                      <div key={skill.skill} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{skill.icon}</span>
                            <span className="font-medium text-gray-900">{skill.skill}</span>
                          </div>
                          <span className={`font-semibold ${getImprovementColor(skill.improvement || 0)}`}>
                            {(skill.improvement || 0) >= 0 ? '+' : ''}{skill.improvement || 0}%
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Поточний рівень: {skill.current || 0}%</span>
                            <span>Попередній: {skill.previous || 0}%</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${skill.current || 0}%` }}
                            ></div>
                          </div>
                          
                          <div className="text-xs text-gray-500 text-center">
                            Поліпшення: {skill.improvementPercent || '0'}%
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      Немає даних про прогрес навичок
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Вкладка По місяцях */}
            {activeTab === 'monthly' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Моя статистика по місяцях</h3>
                <div className="space-y-4">
                  {monthlyStats.length > 0 ? (
                    monthlyStats.map((monthData) => (
                      <div key={monthData.month} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-gray-900">
                            {formatMonth(monthData.month)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {monthData.trainings || 0} тренувань
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Середній результат:</span>
                            <span className={`font-semibold ${getPerformanceColor(monthData.averagePerformance || 0)}`}>
                              {monthData.averagePerformance || 0}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Загальний час:</span>
                            <span className="font-semibold text-blue-600">
                              {formatDuration(monthData.totalDuration || 0)}
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${monthData.averagePerformance || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Немає даних за місяцями
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Вкладка Цілі */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Мої цілі</h3>
                <div className="space-y-4">
                  {goalsProgress.length > 0 ? (
                    goalsProgress.map((goal) => {
                      const progress = Math.min(Math.round(((goal.currentValue || 0) / (goal.targetValue || 1)) * 100), 100);
                      const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      
                      return (
                        <div key={goal.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-gray-900">{goal.title}</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                              daysLeft < 0 ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {goal.status === 'completed' ? 'Завершено' :
                               daysLeft < 0 ? 'Прострочено' :
                               `Залишилось ${daysLeft} дн.`}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Прогрес: {progress}%</span>
                              <span>{goal.currentValue || 0} / {goal.targetValue || 0}</span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  goal.status === 'completed' ? 'bg-green-500' :
                                  daysLeft < 0 ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            
                            {goal.description && (
                              <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Немає цілей для відображення
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Додаткова інформація */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Моя ефективність</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Успішність тренувань</span>
                <span className="font-semibold text-green-600">{overview.successRate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Завершені цілі</span>
                <span className="font-semibold text-blue-600">
                  {overview.completedGoals || 0} / {overview.totalGoals || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Середня тривалість</span>
                <span className="font-semibold text-purple-600">
                  {(overview.completedTrainings || 0) > 0
                    ? formatDuration(Math.round((overview.totalTrainingTime || 0) / (overview.completedTrainings || 1)))
                    : '0 хв'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Мої наступні кроки</h3>
            <div className="space-y-4">
              {nextTraining && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Наступне тренування</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(nextTraining.date)} о {nextTraining.time}
                    </p>
                  </div>
                  <span className="text-green-600 font-medium">{nextTraining.type}</span>
                </div>
              )}
              
              {upcomingTrainings.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Майбутні тренування</p>
                    <p className="text-sm text-gray-600">
                      {upcomingTrainings.length} в черзі
                    </p>
                  </div>
                  <span className="text-blue-600 font-medium">Готуйся!</span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Моя наступна мета</p>
                  <p className="text-sm text-gray-600">
                    Досягти 80% успішності
                  </p>
                </div>
                <span className="text-purple-600 font-medium">🎯</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}