'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Типи для даних
interface StatsCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  avatar: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Мокові дані для демонстрації
  const statsData: StatsCard[] = [
    {
      title: 'Загальний дохід',
      value: '$45,231.89',
      change: '+12%',
      trend: 'up',
      icon: '💰'
    },
    {
      title: 'Активні користувачі',
      value: '12,234',
      change: '+18%',
      trend: 'up',
      icon: '👥'
    },
    {
      title: 'Конверсія',
      value: '32.5%',
      change: '-2%',
      trend: 'down',
      icon: '📊'
    },
    {
      title: 'Завдань виконано',
      value: '1,234',
      change: '+29%',
      trend: 'up',
      icon: '✅'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      user: 'Олександр Петренко',
      action: 'Створив новий проект',
      time: '2 хв тому',
      avatar: '👨‍💼'
    },
    {
      id: 2,
      user: 'Марія Іваненко',
      action: 'Завершила завдання',
      time: '5 хв тому',
      avatar: '👩‍💻'
    },
    {
      id: 3,
      user: 'Петро Сидоренко',
      action: 'Залишив коментар',
      time: '10 хв тому',
      avatar: '👨‍🎨'
    },
    {
      id: 4,
      user: 'Анна Коваленко',
      action: 'Оновила профіль',
      time: '15 хв тому',
      avatar: '👩‍🏫'
    }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження дашборду...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">📊 Панель керування</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-sm text-gray-500">{session.user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {session.user?.name?.charAt(0) || 'U'}
              </div>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Вийти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Ласкаво просимо, {session.user?.name}! 👋
          </h2>
          <p className="text-gray-600">Ось що відбувається у вашому акаунті сьогодні</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{stat.icon}</div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Активність</h3>
                <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                  <option>За останній тиждень</option>
                  <option>За останній місяць</option>
                  <option>За останній рік</option>
                </select>
              </div>
              
              {/* Simple Chart Placeholder */}
              <div className="bg-linear-to-b from-blue-50 to-indigo-50 rounded-lg p-8">
                <div className="flex items-end justify-between h-40">
                  {[40, 60, 75, 55, 80, 65, 90].map((height, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-8 bg-linear-to-t from-blue-500 to-purple-600 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">День {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Швидкі дії</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200">
                  <span className="text-2xl">📁</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Новий проект</div>
                    <div className="text-sm text-gray-500">Створити проект</div>
                  </span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200">
                  <span className="text-2xl">📊</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Звіт</div>
                    <div className="text-sm text-gray-500">Згенерувати звіт</div>
                  </span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200">
                  <span className="text-2xl">👥</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Команда</div>
                    <div className="text-sm text-gray-500">Керувати командою</div>
                  </span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200">
                  <span className="text-2xl">⚙️</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Налаштування</div>
                    <div className="text-sm text-gray-500">Налаштування акаунта</div>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity & Profile */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Остання активність</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                Переглянути всю активність
              </button>
            </div>

            {/* Profile Summary */}
            <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Ваш профіль</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Статус:</span>
                  <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-medium">Активний</span>
                </div>
                <div className="flex justify-between">
                  <span>Дата реєстрації:</span>
                  <span>{new Date().toLocaleDateString('uk-UA')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Роль:</span>
                  <span>Користувач</span>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                Редагувати профіль
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 Ваша платформа. Всі права захищені.
            </p>
            <div className="flex space-x-6">
              <button className="text-gray-500 hover:text-gray-700 text-sm">Допомога</button>
              <button className="text-gray-500 hover:text-gray-700 text-sm">Умови</button>
              <button className="text-gray-500 hover:text-gray-700 text-sm">Конфіденційність</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}