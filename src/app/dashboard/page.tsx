'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TrainingPlan {
  id: number;
  title: string;
  duration: string;
  intensity: 'low' | 'medium' | 'high';
  completed: boolean;
  exercises: string[];
}

interface ProgressStats {
  skill: string;
  current: number;
  previous: number;
  icon: string;
}

interface NextTraining {
  date: string;
  time: string;
  type: string;
  focus: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('training');

  // Дані для тренувань
  const trainingPlans: TrainingPlan[] = [
    {
      id: 1,
      title: 'Техніка ведення мʼяча',
      duration: '45 хв',
      intensity: 'medium',
      completed: true,
      exercises: ['Ведення конусів', 'Зміна напрямку', 'Фінти']
    },
    {
      id: 2,
      title: 'Ударна техніка',
      duration: '60 хв',
      intensity: 'high',
      completed: false,
      exercises: ['Удари з різних дистанцій', 'Точність', 'Сила удару']
    },
    {
      id: 3,
      title: 'Тактична підготовка',
      duration: '50 хв',
      intensity: 'medium',
      completed: false,
      exercises: ['Позиційна гра', 'Командні дії', 'Стратегія']
    },
    {
      id: 4,
      title: 'Фізична підготовка',
      duration: '40 хв',
      intensity: 'high',
      completed: false,
      exercises: ['Спринт', 'Стрибки', 'Витривалість']
    }
  ];

  const progressStats: ProgressStats[] = [
    {
      skill: 'Техніка',
      current: 75,
      previous: 65,
      icon: '⚽'
    },
    {
      skill: 'Швидкість',
      current: 82,
      previous: 70,
      icon: '💨'
    },
    {
      skill: 'Точність',
      current: 68,
      previous: 55,
      icon: '🎯'
    },
    {
      skill: 'Фізика',
      current: 71,
      previous: 60,
      icon: '💪'
    }
  ];

  const nextTraining: NextTraining = {
    date: '15 Лютого 2024',
    time: '18:00',
    type: 'Індивідуальне',
    focus: 'Ударна техніка'
  };

  const coachNotes = [
    'Працюй над контролем мʼяча під тиском',
    'Збільшуй швидкість прийняття рішень',
    'Покращуй точність передач на дальні дистанції',
    'Розвивай ліву ногу'
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження дашборду...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">🥅 Футбольний Дашборд</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-sm text-gray-500">Учень</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                {session.user?.name?.charAt(0) || 'У'}
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
            Вітаю, {session.user?.name}! ⚽
          </h2>
          <p className="text-gray-600">Твій прогрес та наступні тренування</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {progressStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{stat.icon}</div>
                <span className={`text-sm font-medium ${
                  stat.current > stat.previous ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.current > stat.previous ? '+' : ''}{stat.current - stat.previous}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.current}%</h3>
              <p className="text-gray-600 text-sm">{stat.skill}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stat.current}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Training Plans */}
          <div className="lg:col-span-2 space-y-8">
            {/* Training Plans */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">План тренувань</h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {trainingPlans.filter(t => t.completed).length}/{trainingPlans.length} завершено
                </span>
              </div>
              
              <div className="space-y-4">
                {trainingPlans.map((training) => (
                  <div
                    key={training.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      training.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          training.intensity === 'high' ? 'bg-red-500' :
                          training.intensity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <h4 className="font-semibold text-gray-900">{training.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{training.duration}</span>
                        {training.completed ? (
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Завершено</span>
                        ) : (
                          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Розпочати
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {training.exercises.map((exercise, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                        >
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Швидкі дії</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200">
                  <span className="text-2xl">📹</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Аналіз гри</div>
                    <div className="text-sm text-gray-500">Переглянути запис</div>
                  </span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200">
                  <span className="text-2xl">📊</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Прогрес</div>
                    <div className="text-sm text-gray-500">Детальна статистика</div>
                  </span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200">
                  <span className="text-2xl">🎯</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Цілі</div>
                    <div className="text-sm text-gray-500">Мої цілі</div>
                  </span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200">
                  <span className="text-2xl">👨‍🏫</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Тренер</div>
                    <div className="text-sm text-gray-500">Звʼязатись</div>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Next Training & Coach Notes */}
          <div className="space-y-8">
            {/* Next Training */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Наступне тренування</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-100">Дата:</span>
                  <span className="font-semibold">{nextTraining.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-100">Час:</span>
                  <span className="font-semibold">{nextTraining.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-100">Тип:</span>
                  <span className="font-semibold">{nextTraining.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-100">Фокус:</span>
                  <span className="font-semibold">{nextTraining.focus}</span>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-white text-green-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                Підготуватись до тренування
              </button>
            </div>

            {/* Coach Notes */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                <span className="flex items-center">
                  <span className="mr-2">👨‍🏫</span>
                  Рекомендації тренера
                </span>
              </h3>
              <div className="space-y-3">
                {coachNotes.map((note, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-yellow-500 mt-0.5">💡</span>
                    <p className="text-sm text-yellow-800">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">🏆 Досягнення</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs text-gray-600">Серія тренувань</div>
                  <div className="font-bold text-green-600">5 днів</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs text-gray-600">Рекорд швидкості</div>
                  <div className="font-bold text-blue-600">+12%</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs text-gray-600">Точність</div>
                  <div className="font-bold text-purple-600">85%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 Футбольна академія. Твій шлях до успіху!
            </p>
            <div className="flex space-x-6">
              <button className="text-gray-500 hover:text-gray-700 text-sm">Розклад</button>
              <button className="text-gray-500 hover:text-gray-700 text-sm">Допомога</button>
              <button className="text-gray-500 hover:text-gray-700 text-sm">Тренер</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}