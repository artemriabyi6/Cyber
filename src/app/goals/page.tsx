"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: "technical" | "physical" | "tactical" | "mental";
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: "active" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  createdAt: string;
  exercises: string[];
  userId: string;
}

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "technical" as Goal["category"],
    targetValue: 100,
    deadline: "",
    priority: "medium" as Goal["priority"],
    exercises: [""]
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error("Користувач не авторизований");
      }

      const response = await fetch(
        `http://localhost:3001/goals?userId=${session.user.id}`
      );
      
      if (!response.ok) {
        throw new Error("Не вдалося завантажити цілі");
      }

      const userGoals = await response.json();
      setGoals(userGoals);
    } catch (err) {
      console.error("Помилка завантаження цілей:", err);
      setError("Не вдалося завантажити цілі. Спробуйте пізніше.");
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
      fetchGoals();
    }
  }, [status, session, router]);

  const addGoal = async () => {
    try {
      const goalToAdd: Goal = {
        ...newGoal,
        id: Date.now().toString(), // Конвертуємо в рядок
        userId: session?.user?.id || "",
        currentValue: 0,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0]
      };

      const response = await fetch("http://localhost:3001/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalToAdd),
      });

      if (response.ok) {
        setGoals(prev => [...prev, goalToAdd]);
        setIsAddModalOpen(false);
        setNewGoal({
          title: "",
          description: "",
          category: "technical",
          targetValue: 100,
          deadline: "",
          priority: "medium",
          exercises: [""]
        });
      }
    } catch (err) {
      console.error("Помилка додавання цілі:", err);
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const updatedGoal = {
        ...goal,
        currentValue: newValue,
        status: newValue >= goal.targetValue ? "completed" : goal.status
      };

      const response = await fetch(`http://localhost:3001/goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedGoal),
      });

      if (response.ok) {
        setGoals(prev =>
          prev.map(goal =>
            goal.id === goalId ? updatedGoal : goal
          )
        );
      }
    } catch (err) {
      console.error("Помилка оновлення цілі:", err);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/goals/${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
      }
    } catch (err) {
      console.error("Помилка видалення цілі:", err);
    }
  };

  const getCategoryIcon = (category: Goal["category"]) => {
    switch (category) {
      case "technical": return "⚽";
      case "physical": return "💪";
      case "tactical": return "🧠";
      case "mental": return "😌";
      default: return "🎯";
    }
  };

  const getPriorityColor = (priority: Goal["priority"]) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "yellow";
      case "low": return "green";
      default: return "gray";
    }
  };

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "completed": return "green";
      case "overdue": return "red";
      case "active": return "blue";
      default: return "gray";
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (activeFilter === "all") return true;
    return goal.status === activeFilter;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-lg">←</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 Мої цілі
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
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всього цілей</p>
                <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активні</p>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.filter(g => g.status === "active").length}
                </p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Завершені</p>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.filter(g => g.status === "completed").length}
                </p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Успішність</p>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.length > 0 
                    ? Math.round((goals.filter(g => g.status === "completed").length / goals.length) * 100)
                    : 0
                  }%
                </p>
              </div>
              <div className="text-2xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Всі цілі
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "active"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Активні
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Завершені
            </button>
            <button
              onClick={() => setActiveFilter("overdue")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "overdue"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Протерміновані
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Додати ціль</span>
          </button>
        </div>

        {/* Goals Grid */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">😔</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchGoals}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Спробувати знову
            </button>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeFilter === "all" ? "Ще немає цілей" : "Не знайдено цілей"}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === "all" 
                ? "Створіть свою першу ціль, щоб почати відстежувати прогрес"
                : "Немає цілей з обраним фільтром"
              }
            </p>
            {activeFilter === "all" && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Створити ціль
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                {/* Goal Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getCategoryIcon(goal.category)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(goal.priority)}-100 text-${getPriorityColor(goal.priority)}-800`}
                      >
                        {goal.priority === "high" ? "Високий" : goal.priority === "medium" ? "Середній" : "Низький"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(goal.status)}-100 text-${getStatusColor(goal.status)}-800`}
                      >
                        {goal.status === "completed" ? "Завершено" : goal.status === "overdue" ? "Протерміновано" : "Активна"}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Прогрес</span>
                      <span>{goal.currentValue} / {goal.targetValue}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.status === "completed" 
                            ? "bg-green-500" 
                            : goal.status === "overdue"
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-600"
                        }`}
                        style={{ 
                          width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Дедлайн: {new Date(goal.deadline).toLocaleDateString()}</span>
                    <span>
                      {Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} днів
                    </span>
                  </div>
                </div>

                {/* Exercises */}
                <div className="p-4 border-b">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Вправи:</h4>
                  <div className="flex flex-wrap gap-1">
                    {goal.exercises.map((exercise, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {exercise}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex justify-between">
                  <button
                    onClick={() => updateGoalProgress(goal.id, Math.min(goal.currentValue + 10, goal.targetValue))}
                    disabled={goal.status === "completed"}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      goal.status === "completed"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    + Прогрес
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Нова ціль
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Назва цілі
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Наприклад: Покращити точність пасу"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Опис
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                  placeholder="Детальний опис цілі..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категорія
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value as Goal["category"]})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="technical">Технічна</option>
                    <option value="physical">Фізична</option>
                    <option value="tactical">Тактична</option>
                    <option value="mental">Ментальна</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пріоритет
                  </label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value as Goal["priority"]})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Низький</option>
                    <option value="medium">Середній</option>
                    <option value="high">Високий</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цільове значення
                  </label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({...newGoal, targetValue: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дедлайн
                  </label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Вправи (через кому)
                </label>
                <input
                  type="text"
                  value={newGoal.exercises.join(", ")}
                  onChange={(e) => setNewGoal({...newGoal, exercises: e.target.value.split(", ")})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Вправа 1, Вправа 2, ..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Скасувати
              </button>
              <button
                onClick={addGoal}
                disabled={!newGoal.title || !newGoal.deadline}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
              >
                Створити ціль
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}