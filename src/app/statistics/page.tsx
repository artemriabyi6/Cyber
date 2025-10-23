// 'use client';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Bar, Line, Doughnut } from 'react-chartjs-2';

// // Реєструємо компоненти Chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// );

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   createdAt: string;
// }

// interface TrainingPlan {
//   id: string;
//   title: string;
//   duration: string;
//   intensity: string;
//   completed: boolean;
//   exercises: string[];
//   assignedTo: string[];
//   createdBy: string;
//   date: string;
//   completedDate?: string;
// }

// interface TrainingSession {
//   id: string;
//   trainingPlanId: string;
//   userId: string;
//   date: string;
//   duration: string;
//   performance: number;
//   coachNotes: string;
//   completed: boolean;
// }

// interface ProgressStats {
//   id: string;
//   userId: string;
//   skill: string;
//   current: number;
//   previous: number;
//   icon: string;
// }

// interface StatisticsData {
//   studentProgress: {
//     labels: string[];
//     data: number[];
//   };
//   trainingCompletion: {
//     completed: number;
//     pending: number;
//   };
//   performanceTrend: {
//     months: string[];
//     scores: number[];
//   };
//   skillDistribution: {
//     skills: string[];
//     averages: number[];
//   };
//   topPerformers: Array<{
//     name: string;
//     performance: number;
//     completedTrainings: number;
//   }>;
// }

// export default function Statistics() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [statistics, setStatistics] = useState<StatisticsData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/signin');
//     } else if (status === 'authenticated') {
//       fetchStatistics();
//     }
//   }, [status, timeRange]);

//   const fetchStatistics = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Завантажуємо всі необхідні дані
//       const [usersRes, trainingPlansRes, trainingSessionsRes, progressStatsRes] = await Promise.all([
//         fetch('http://localhost:3001/users'),
//         fetch('http://localhost:3001/trainingPlans'),
//         fetch('http://localhost:3001/trainingSessions'),
//         fetch('http://localhost:3001/progressStats')
//       ]);

//       if (!usersRes.ok || !trainingPlansRes.ok) {
//         throw new Error('Помилка завантаження даних');
//       }

//       const [users, trainingPlans, trainingSessions, progressStats] = await Promise.all([
//         usersRes.json(),
//         trainingPlansRes.json(),
//         trainingSessionsRes.ok ? trainingSessionsRes.json() : [],
//         progressStatsRes.ok ? progressStatsRes.json() : []
//       ]);

//       // Обробляємо дані для статистики
//       const processedData = processStatisticsData(users, trainingPlans, trainingSessions, progressStats);
//       setStatistics(processedData);

//     } catch (error) {
//       console.error('Помилка завантаження статистики:', error);
//       setError('Не вдалося завантажити статистику. Спробуйте пізніше.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processStatisticsData = (
//     users: User[], 
//     trainingPlans: TrainingPlan[], 
//     trainingSessions: TrainingSession[], 
//     progressStats: ProgressStats[]
//   ): StatisticsData => {
//     // Фільтруємо тільки студентів (виключаємо тренера та користувачів без ролі)
//     const students = users.filter(user => 
//       user.role === 'student' || 
//       (!user.role && user.id !== 'coach-1') // Додаємо користувачів без ролі, але не тренера
//     );
    
//     console.log('Students found:', students);
//     console.log('Progress stats:', progressStats);
//     console.log('Training plans:', trainingPlans);

//     // Прогрес учнів - використовуємо дані з progressStats
//     const studentProgress = {
//       labels: students.map(student => student.name),
//       data: students.map(student => {
//         const studentStats = progressStats.filter(stat => stat.userId === student.id);
//         console.log(`Student ${student.name} stats:`, studentStats);
//         return studentStats.length > 0 
//           ? Math.round(studentStats.reduce((sum, stat) => sum + stat.current, 0) / studentStats.length)
//           : 0; // Якщо немає статистики, встановлюємо 0
//       })
//     };

//     console.log('Student progress data:', studentProgress);

//     // Завершеність тренувань
//     const trainingCompletion = {
//       completed: trainingPlans.filter(plan => plan.completed).length,
//       pending: trainingPlans.filter(plan => !plan.completed).length
//     };

//     // Тренд успішності - розраховуємо на основі реальних даних
//     const currentMonth = new Date().getMonth();
//     const months = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
//     const performanceTrend = {
//       months: months.slice(0, currentMonth + 1),
//       scores: months.slice(0, currentMonth + 1).map((_, index) => {
//         // Симулюємо прогресивне покращення на основі середньої успішності
//         const baseScore = studentProgress.data.length > 0 
//           ? Math.round(studentProgress.data.reduce((a, b) => a + b, 0) / studentProgress.data.length)
//           : 50;
//         return Math.min(100, baseScore - 10 + (index * 5));
//       })
//     };

//     // Розподіл навичок
//     const allSkills = [...new Set(progressStats.map(stat => stat.skill))];
//     const skillDistribution = {
//       skills: allSkills,
//       averages: allSkills.map(skill => {
//         const skillStats = progressStats.filter(stat => stat.skill === skill);
//         return skillStats.length > 0 
//           ? Math.round(skillStats.reduce((sum, stat) => sum + stat.current, 0) / skillStats.length)
//           : 0;
//       })
//     };

//     // Топ перформери
//     const topPerformers = students.map(student => {
//       const studentStats = progressStats.filter(stat => stat.userId === student.id);
//       const averagePerformance = studentStats.length > 0 
//         ? Math.round(studentStats.reduce((sum, stat) => sum + stat.current, 0) / studentStats.length)
//         : 0;
      
//       const completedTrainings = trainingPlans.filter(plan => 
//         plan.assignedTo.includes(student.id) && plan.completed
//       ).length;

//       return {
//         name: student.name,
//         performance: averagePerformance,
//         completedTrainings
//       };
//     }).filter(performer => performer.performance > 0) // Фільтруємо тих, у кого є прогрес
//       .sort((a, b) => b.performance - a.performance)
//       .slice(0, 5);

//     return {
//       studentProgress,
//       trainingCompletion,
//       performanceTrend,
//       skillDistribution,
//       topPerformers
//     };
//   };

//   // Налаштування для графіків
//   const barChartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       title: {
//         display: true,
//         text: 'Прогрес учнів',
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         max: 100,
//         title: {
//           display: true,
//           text: 'Успішність (%)'
//         }
//       },
//     },
//   };

//   const lineChartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       title: {
//         display: true,
//         text: 'Тренд успішності',
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         max: 100,
//         title: {
//           display: true,
//           text: 'Середня успішність (%)'
//         }
//       },
//     },
//   };

//   const doughnutOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'bottom' as const,
//       },
//       title: {
//         display: true,
//         text: 'Завершеність тренувань',
//       },
//     },
//   };

//   if (status === 'loading' || loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Завантаження статистики...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!session) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <h1 className="text-2xl font-bold text-gray-900">📊 Статистика</h1>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <div className="text-right">
//                 <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
//                 <p className="text-sm text-gray-500 capitalize">{session.user?.role}</p>
//               </div>
              
//               {/* Фільтр за періодом */}
//               <div className="flex space-x-2">
//                 <select
//                   value={timeRange}
//                   onChange={(e) => setTimeRange(e.target.value as any)}
//                   className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 >
//                   <option value="week">Тиждень</option>
//                   <option value="month">Місяць</option>
//                   <option value="year">Рік</option>
//                 </select>
//               </div>

//               <button
//                 onClick={() => router.back()}
//                 className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
//               >
//                 Назад
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Welcome Section */}
//         <div className="mb-8">
//           <h2 className="text-3xl font-bold text-gray-900 mb-2">
//             Аналітика та статистика 📈
//           </h2>
//           <p className="text-gray-600">
//             Детальний аналіз прогресу учнів та ефективності тренувань на основі реальних даних
//           </p>
//         </div>

//         {/* Показуємо помилки */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//             <div className="flex items-center">
//               <span className="text-red-500 mr-2">⚠️</span>
//               <span>{error}</span>
//               <button 
//                 onClick={() => setError(null)}
//                 className="ml-auto text-red-500 hover:text-red-700"
//               >
//                 ×
//               </button>
//             </div>
//           </div>
//         )}

//         {!statistics ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500">Дані статистики не знайдені</p>
//             <button
//               onClick={fetchStatistics}
//               className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
//             >
//               Спробувати знову
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-8">
//             {/* Перший ряд: Прогрес учнів та Тренд успішності */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {/* Графік прогресу учнів */}
//               <div className="bg-white rounded-xl shadow-sm border p-6">
//                 {statistics.studentProgress.labels.length > 0 && statistics.studentProgress.data.some(val => val > 0) ? (
//                   <Bar
//                     data={{
//                       labels: statistics.studentProgress.labels,
//                       datasets: [
//                         {
//                           label: 'Успішність (%)',
//                           data: statistics.studentProgress.data,
//                           backgroundColor: [
//                             'rgba(147, 51, 234, 0.8)',
//                             'rgba(59, 130, 246, 0.8)',
//                             'rgba(16, 185, 129, 0.8)',
//                             'rgba(245, 158, 11, 0.8)',
//                             'rgba(239, 68, 68, 0.8)',
//                             'rgba(139, 69, 19, 0.8)',
//                             'rgba(75, 0, 130, 0.8)',
//                           ],
//                           borderColor: [
//                             'rgb(147, 51, 234)',
//                             'rgb(59, 130, 246)',
//                             'rgb(16, 185, 129)',
//                             'rgb(245, 158, 11)',
//                             'rgb(239, 68, 68)',
//                             'rgb(139, 69, 19)',
//                             'rgb(75, 0, 130)',
//                           ],
//                           borderWidth: 1,
//                         },
//                       ],
//                     }}
//                     options={barChartOptions}
//                     height={300}
//                   />
//                 ) : (
//                   <div className="text-center py-8">
//                     <p className="text-gray-500">Немає даних про прогрес учнів</p>
//                     <button
//                       onClick={fetchStatistics}
//                       className="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
//                     >
//                       Оновити дані
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Тренд успішності */}
//               <div className="bg-white rounded-xl shadow-sm border p-6">
//                 <Line
//                   data={{
//                     labels: statistics.performanceTrend.months,
//                     datasets: [
//                       {
//                         label: 'Середня успішність',
//                         data: statistics.performanceTrend.scores,
//                         borderColor: 'rgb(147, 51, 234)',
//                         backgroundColor: 'rgba(147, 51, 234, 0.1)',
//                         tension: 0.3,
//                         fill: true,
//                       },
//                     ],
//                   }}
//                   options={lineChartOptions}
//                   height={300}
//                 />
//               </div>
//             </div>

//             {/* Другий ряд: Завершеність тренувань та Розподіл навичок */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {/* Діаграма завершеності тренувань */}
//               <div className="bg-white rounded-xl shadow-sm border p-6">
//                 <div className="flex flex-col items-center">
//                   <Doughnut
//                     data={{
//                       labels: ['Завершені', 'В очікуванні'],
//                       datasets: [
//                         {
//                           data: [
//                             statistics.trainingCompletion.completed,
//                             statistics.trainingCompletion.pending,
//                           ],
//                           backgroundColor: [
//                             'rgba(16, 185, 129, 0.8)',
//                             'rgba(245, 158, 11, 0.8)',
//                           ],
//                           borderColor: [
//                             'rgb(16, 185, 129)',
//                             'rgb(245, 158, 11)',
//                           ],
//                           borderWidth: 2,
//                         },
//                       ],
//                     }}
//                     options={doughnutOptions}
//                     height={250}
//                   />
//                   <div className="mt-4 text-center">
//                     <p className="text-lg font-semibold text-gray-900">
//                       Загальна завершеність: {statistics.trainingCompletion.completed + statistics.trainingCompletion.pending > 0 
//                         ? Math.round(
//                             (statistics.trainingCompletion.completed / 
//                             (statistics.trainingCompletion.completed + statistics.trainingCompletion.pending)) * 100
//                           )
//                         : 0
//                       }%
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Розподіл навичок */}
//               <div className="bg-white rounded-xl shadow-sm border p-6">
//                 {statistics.skillDistribution.skills.length > 0 ? (
//                   <Bar
//                     data={{
//                       labels: statistics.skillDistribution.skills,
//                       datasets: [
//                         {
//                           label: 'Середній рівень (%)',
//                           data: statistics.skillDistribution.averages,
//                           backgroundColor: 'rgba(59, 130, 246, 0.8)',
//                           borderColor: 'rgb(59, 130, 246)',
//                           borderWidth: 1,
//                         },
//                       ],
//                     }}
//                     options={{
//                       ...barChartOptions,
//                       plugins: {
//                         ...barChartOptions.plugins,
//                         title: {
//                           display: true,
//                           text: 'Розподіл навичок',
//                         },
//                       },
//                     }}
//                     height={300}
//                   />
//                 ) : (
//                   <div className="text-center py-8">
//                     <p className="text-gray-500">Немає даних про навички</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Третій ряд: Ключові метрики */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold mb-2">
//                     {statistics.trainingCompletion.completed + statistics.trainingCompletion.pending}
//                   </div>
//                   <div className="text-purple-100">Всього тренувань</div>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold mb-2">
//                     {statistics.studentProgress.data.length > 0 && statistics.studentProgress.data.some(val => val > 0)
//                       ? Math.round(
//                           statistics.studentProgress.data.reduce((a, b) => a + b, 0) / 
//                           statistics.studentProgress.data.length
//                         )
//                       : 0
//                     }%
//                   </div>
//                   <div className="text-green-100">Середня успішність</div>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold mb-2">
//                     {statistics.studentProgress.labels.length}
//                   </div>
//                   <div className="text-orange-100">Активних учнів</div>
//                 </div>
//               </div>
//             </div>

//             {/* Четвертий ряд: Топ перформери */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 🏆 Топ учні за успішністю
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//                 {statistics.topPerformers.map((performer, index) => (
//                   <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
//                     <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
//                       {performer.name.charAt(0)}
//                     </div>
//                     <h4 className="font-semibold text-gray-900 text-sm mb-1">{performer.name}</h4>
//                     <p className="text-2xl font-bold text-green-600 mb-1">{performer.performance}%</p>
//                     <p className="text-xs text-gray-500">{performer.completedTrainings} тренувань</p>
//                   </div>
//                 ))}
//                 {statistics.topPerformers.length === 0 && (
//                   <div className="col-span-5 text-center py-4">
//                     <p className="text-gray-500">Немає даних про успішність учнів</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Детальна таблиця прогресу */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Детальний прогрес учнів
//               </h3>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead>
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Учень
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Успішність
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Статус
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Прогрес
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {statistics.studentProgress.labels.map((student, index) => {
//                       const performance = statistics.studentProgress.data[index];
//                       return (
//                         <tr key={index}>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
//                                 {student.charAt(0)}
//                               </div>
//                               <div className="ml-4">
//                                 <div className="text-sm font-medium text-gray-900">
//                                   {student}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm text-gray-900">
//                               {performance}%
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                               performance >= 80 
//                                 ? 'bg-green-100 text-green-800'
//                                 : performance >= 60
//                                 ? 'bg-yellow-100 text-yellow-800'
//                                 : 'bg-red-100 text-red-800'
//                             }`}>
//                               {performance >= 80 
//                                 ? 'Відмінно'
//                                 : performance >= 60
//                                 ? 'Добре'
//                                 : 'Потребує уваги'
//                               }
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                               <div 
//                                 className={`h-2 rounded-full ${
//                                   performance >= 80 
//                                     ? 'bg-green-500'
//                                     : performance >= 60
//                                     ? 'bg-yellow-500'
//                                     : 'bg-red-500'
//                                 }`}
//                                 style={{ width: `${performance}%` }}
//                               ></div>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                     {statistics.studentProgress.labels.length === 0 && (
//                       <tr>
//                         <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
//                           Немає даних про учнів
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="bg-white border-t mt-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <p className="text-gray-500 text-sm">
//               © 2024 Футбольна академія. Всі права захищені.
//             </p>
//             <div className="flex space-x-6">
//               <button 
//                 onClick={fetchStatistics}
//                 className="text-gray-500 hover:text-gray-700 text-sm"
//               >
//                 🔄 Оновити
//               </button>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// app/statistics/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StatisticsData {
  overview: {
    totalTrainings: number;
    completedTrainings: number;
    totalTrainingTime: number;
    averagePerformance: number;
    totalGoals: number;
    completedGoals: number;
    achievementsCount: number;
  };
  monthlyStats: {
    month: string;
    trainings: number;
    averagePerformance: number;
  }[];
  skillProgress: {
    skill: string;
    icon: string;
    current: number;
    previous: number;
    improvement: number;
    improvementPercent: string;
  }[];
  recentTrainings: any[];
  goalsProgress: any[];
}

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      if (response.ok) {
        const statsData = await response.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('Помилка завантаження статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchStatistics();
    }
  }, [status, router]);

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 70) return 'text-yellow-600';
    if (performance >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getImprovementColor = (improvement: number) => {
    return improvement >= 0 ? 'text-green-600' : 'text-red-600';
  };

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
        </div>
      </div>
    );
  }

  const { overview, monthlyStats, skillProgress, recentTrainings, goalsProgress } = statistics;

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
              <h1 className="text-2xl font-bold text-gray-900">📈 Статистика</h1>
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
            <div className="text-sm text-gray-600">Тренувань</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{overview.averagePerformance}%</div>
            <div className="text-sm text-gray-600">Середній результат</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{overview.completedGoals}</div>
            <div className="text-sm text-gray-600">Завершених цілей</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{Math.round(overview.totalTrainingTime / 60)}</div>
            <div className="text-sm text-gray-600">Годин тренувань</div>
          </div>
        </div>

        {/* Навігація по вкладках */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 font-medium ${
                activeTab === 'overview'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Огляд
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 px-6 py-3 font-medium ${
                activeTab === 'progress'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Прогрес навичок
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`flex-1 px-6 py-3 font-medium ${
                activeTab === 'monthly'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              По місяцях
            </button>
          </div>

          <div className="p-6">
            {/* Вкладка Огляд */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Останні тренування</h3>
                  <div className="space-y-3">
                    {recentTrainings.slice(0, 5).map((training) => (
                      <div key={training.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">⚽</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              Тренування {new Date(training.date).toLocaleDateString('uk-UA')}
                            </p>
                            <p className="text-sm text-gray-600">{training.duration}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${getPerformanceColor(training.performance)}`}>
                          {training.performance}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Прогрес цілей</h3>
                  <div className="space-y-3">
                    {goalsProgress.slice(0, 5).map((goal) => {
                      const progress = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
                      return (
                        <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{goal.title}</span>
                            <span className="text-sm text-gray-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Вкладка Прогрес навичок */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Прогрес навичок</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {skillProgress.map((skill) => (
                    <div key={skill.skill} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{skill.icon}</span>
                          <span className="font-medium text-gray-900">{skill.skill}</span>
                        </div>
                        <span className={`font-semibold ${getImprovementColor(skill.improvement)}`}>
                          {skill.improvement >= 0 ? '+' : ''}{skill.improvement}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Поточний рівень: {skill.current}%</span>
                          <span>Попередній: {skill.previous}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${skill.current}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center">
                          Поліпшення: {skill.improvementPercent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Вкладка По місяцях */}
            {activeTab === 'monthly' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Статистика по місяцях</h3>
                <div className="space-y-4">
                  {monthlyStats.map((monthData) => (
                    <div key={monthData.month} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-900">
                          {formatMonth(monthData.month)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {monthData.trainings} тренувань
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Середній результат:</span>
                          <span className={`font-semibold ${getPerformanceColor(monthData.averagePerformance)}`}>
                            {monthData.averagePerformance}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${monthData.averagePerformance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Додаткова інформація */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Досягнення</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-gray-600">
                У вас {overview.achievementsCount} досягнень
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Продовжуйте тренуватися для отримання нових досягнень!
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Ефективність</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Успішність тренувань</span>
                <span className="font-semibold text-green-600">
                  {overview.totalTrainings > 0 
                    ? Math.round((overview.completedTrainings / overview.totalTrainings) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Прогрес цілей</span>
                <span className="font-semibold text-blue-600">
                  {overview.totalGoals > 0
                    ? Math.round((overview.completedGoals / overview.totalGoals) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Середня тривалість</span>
                <span className="font-semibold text-purple-600">
                  {overview.completedTrainings > 0
                    ? Math.round(overview.totalTrainingTime / overview.completedTrainings)
                    : 0
                  } хв
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}