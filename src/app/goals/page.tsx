// app/goals/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  priority: "low" | "medium" | "high";
  exercises: string[];
  status: "active" | "completed" | "cancelled";
  createdAt: string;
}

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "technical",
    targetValue: 100,
    deadline: "",
    priority: "medium" as "low" | "medium" | "high",
    exercises: [""]
  });

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const goalsData = await response.json();
        setGoals(goalsData);
      }
    } catch (error) {
      console.error('Помилка завантаження цілей:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchGoals();
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newGoal = await response.json();
        setGoals(prev => [newGoal, ...prev]);
        setShowForm(false);
        setFormData({
          title: "",
          description: "",
          category: "technical",
          targetValue: 100,
          deadline: "",
          priority: "medium",
          exercises: [""]
        });
      }
    } catch (error) {
      console.error('Помилка створення цілі:', error);
    }
  };

  const updateGoalProgress = async (goalId: string, currentValue: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentValue }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? updatedGoal : goal
        ));
      }
    } catch (error) {
      console.error('Помилка оновлення цілі:', error);
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed', currentValue: 100 }),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? updatedGoal : goal
        ));
      }
    } catch (error) {
      console.error('Помилка завершення цілі:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
      }
    } catch (error) {
      console.error('Помилка видалення цілі:', error);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return '⚽';
      case 'physical': return '💪';
      case 'tactical': return '🧠';
      case 'mental': return '🧘';
      default: return '🎯';
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження цілей...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100">
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
              <h1 className="text-2xl font-bold text-gray-900">🎯 Мої цілі</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Нова ціль
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{goals.length}</div>
            <div className="text-sm text-gray-600">Всього цілей</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{activeGoals.length}</div>
            <div className="text-sm text-gray-600">Активних</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{completedGoals.length}</div>
            <div className="text-sm text-gray-600">Завершених</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {activeGoals.length > 0 
                ? Math.round(activeGoals.reduce((acc, goal) => acc + (goal.currentValue / goal.targetValue * 100), 0) / activeGoals.length)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Середній прогрес</div>
          </div>
        </div>

        {/* Форма створення нової цілі */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">🎯 Нова ціль</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Назва цілі *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Опис
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Категорія *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="technical">Техніка</option>
                      <option value="physical">Фізична підготовка</option>
                      <option value="tactical">Тактика</option>
                      <option value="mental">Психологія</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Пріоритет
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as "low" | "medium" | "high"})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="low">Низький</option>
                      <option value="medium">Середній</option>
                      <option value="high">Високий</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цільове значення *
                    </label>
                    <input
                      type="number"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дедлайн *
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Створити ціль
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Список цілей */}
        <div className="space-y-6">
          {/* Активні цілі */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Активні цілі ({activeGoals.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGoals.map((goal) => {
                const progress = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
                const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={goal.id} className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(goal.priority)}`}>
                            {goal.priority === 'high' ? 'Високий' : goal.priority === 'medium' ? 'Середній' : 'Низький'} пріоритет
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>

                    {goal.description && (
                      <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                    )}

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Прогрес: {goal.currentValue}/{goal.targetValue}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(progress)} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Дедлайн: {new Date(goal.deadline).toLocaleDateString('uk-UA')}</span>
                        <span className={daysLeft < 7 ? 'text-red-600 font-medium' : ''}>
                          {daysLeft > 0 ? `Залишилось ${daysLeft} днів` : 'Протерміновано'}
                        </span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <input
                          type="number"
                          min="0"
                          max={goal.targetValue}
                          value={goal.currentValue}
                          onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => completeGoal(goal.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Завершити
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeGoals.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Немає активних цілей
                </h3>
                <p className="text-gray-600 mb-4">
                  Створіть свою першу ціль для покращення навичок
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Створити ціль
                </button>
              </div>
            )}
          </div>

          {/* Завершені цілі */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Завершені цілі ({completedGoals.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="bg-green-50 rounded-xl border border-green-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Завершено
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium">
                        Досягнуто: {goal.currentValue}/{goal.targetValue}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(goal.deadline).toLocaleDateString('uk-UA')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}