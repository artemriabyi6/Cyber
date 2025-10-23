// "use client";
// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// interface TrainingPlan {
//   id: number;
//   title: string;
//   duration: string;
//   intensity: "low" | "medium" | "high";
//   completed: boolean;
//   exercises: string[];
//   assignedTo: string[];
//   date: string;
//   completedDate?: string;
// }

// interface ProgressStats {
//   id: number;
//   userId: string;
//   skill: string;
//   current: number;
//   previous: number;
//   icon: string;
// }

// interface NextTraining {
//   id: number;
//   date: string;
//   time: string;
//   type: string;
//   focus: string;
// }

// interface CoachNote {
//   id: number;
//   note: string;
// }

// interface Achievement {
//   id: number;
//   userId: string;
//   icon: string;
//   title: string;
//   value: string;
//   color: string;
// }

// interface DashboardData {
//   trainingPlans: TrainingPlan[];
//   progressStats: ProgressStats[];
//   nextTraining: NextTraining;
//   coachNotes: CoachNote[];
//   achievements: Achievement[];
// }

// export default function Dashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentArchivePage, setCurrentArchivePage] = useState(1);
//   const [currentQueuePage, setCurrentQueuePage] = useState(1);
//   const trainingsPerPage = 5;

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!session?.user?.id) {
//         throw new Error("Користувач не авторизований");
//       }

//       const userId = session.user.id;

//       const trainingPlansRes = await fetch("http://localhost:3001/trainingPlans");
//       const trainingPlans = await trainingPlansRes.json();
//       const userTrainingPlans = trainingPlans.filter((plan: TrainingPlan) =>
//         plan.assignedTo.includes(userId)
//       );

//       const progressStatsRes = await fetch(`http://localhost:3001/progressStats?userId=${userId}`);
//       const userProgressStats = await progressStatsRes.json();

//       const [nextTrainingRes, coachNotesRes, achievementsRes] = await Promise.all([
//         fetch(`http://localhost:3001/nextTrainings?userId=${userId}`),
//         fetch("http://localhost:3001/coachNotes"),
//         fetch(`http://localhost:3001/achievements?userId=${userId}`),
//       ]);

//       let nextTraining = {
//         id: 1,
//         date: "Не встановлено",
//         time: "",
//         type: "",
//         focus: "",
//       };
//       let coachNotes: CoachNote[] = [];
//       let userAchievements: Achievement[] = [];

//       if (nextTrainingRes.ok) {
//         const nextTrainings = await nextTrainingRes.json();
//         nextTraining = nextTrainings[0] || nextTraining;
//       }

//       if (coachNotesRes.ok) {
//         coachNotes = await coachNotesRes.json();
//       }

//       if (achievementsRes.ok) {
//         userAchievements = await achievementsRes.json();
//       }

//       setDashboardData({
//         trainingPlans: userTrainingPlans,
//         progressStats: userProgressStats,
//         nextTraining,
//         coachNotes,
//         achievements: userAchievements,
//       });
//     } catch (err) {
//       console.error("Помилка завантаження даних:", err);
//       setError("Не вдалося завантажити дані. Спробуйте пізніше.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/signin");
//     } else if (status === "authenticated") {
//       if (session.user?.role === "coach") {
//         router.push("/coach-dashboard");
//         return;
//       }
//       fetchDashboardData();
//     }
//   }, [status, session, router]);

//   // Функція для оновлення статусу тренування
//   const updateTrainingStatus = async (trainingId: number, completed: boolean) => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/trainingPlans/${trainingId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ completed }),
//         }
//       );

//       if (response.ok) {
//         setDashboardData((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 trainingPlans: prev.trainingPlans.map((training) =>
//                   training.id === trainingId
//                     ? { ...training, completed }
//                     : training
//                 ),
//               }
//             : null
//         );
//       }
//     } catch (err) {
//       console.error("Помилка оновлення тренування:", err);
//     }
//   };

//   // Функція для форматування дати
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('uk-UA', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric'
//     });
//   };

//   // Функція для отримання кольору інтенсивності
//   const getIntensityColor = (intensity: string) => {
//     switch (intensity) {
//       case "high": return "text-red-500";
//       case "medium": return "text-yellow-500";
//       case "low": return "text-green-500";
//       default: return "text-gray-500";
//     }
//   };

//   // Функція для отримання тексту інтенсивності
//   const getIntensityText = (intensity: string) => {
//     switch (intensity) {
//       case "high": return "Висока";
//       case "medium": return "Середня";
//       case "low": return "Низька";
//       default: return "Не вказано";
//     }
//   };

//   // Пагінація для архіву
//   const getPaginatedArchiveTrainings = () => {
//     if (!dashboardData) return [];
    
//     const completedTrainings = dashboardData.trainingPlans.filter(training => training.completed);
//     const sortedCompletedTrainings = [...completedTrainings].sort((a, b) => 
//       new Date(b.completedDate || b.date).getTime() - new Date(a.completedDate || a.date).getTime()
//     );

//     const startIndex = (currentArchivePage - 1) * trainingsPerPage;
//     const endIndex = startIndex + trainingsPerPage;
    
//     return sortedCompletedTrainings.slice(startIndex, endIndex);
//   };

//   // Пагінація для тренувань в черзі
//   const getPaginatedQueueTrainings = () => {
//     if (!dashboardData) return [];
    
//     const queueTrainings = dashboardData.trainingPlans.filter(training => !training.completed);
//     const sortedQueueTrainings = [...queueTrainings].sort((a, b) => 
//       new Date(a.date).getTime() - new Date(b.date).getTime()
//     );

//     const startIndex = (currentQueuePage - 1) * trainingsPerPage;
//     const endIndex = startIndex + trainingsPerPage;
    
//     return sortedQueueTrainings.slice(startIndex, endIndex);
//   };

//   const getTotalArchivePages = () => {
//     if (!dashboardData) return 0;
//     const completedTrainings = dashboardData.trainingPlans.filter(training => training.completed);
//     return Math.ceil(completedTrainings.length / trainingsPerPage);
//   };

//   const getTotalQueuePages = () => {
//     if (!dashboardData) return 0;
//     const queueTrainings = dashboardData.trainingPlans.filter(training => !training.completed);
//     return Math.ceil(queueTrainings.length / trainingsPerPage);
//   };

//   const paginatedArchiveTrainings = getPaginatedArchiveTrainings();
//   const paginatedQueueTrainings = getPaginatedQueueTrainings();
//   const totalArchivePages = getTotalArchivePages();
//   const totalQueuePages = getTotalQueuePages();

//   if (status === "loading" || loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Завантаження дашборду...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!session) {
//     return null;
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-500 text-xl mb-4">😔</div>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={fetchDashboardData}
//             className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
//           >
//             Спробувати знову
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!dashboardData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600">Дані не знайдені</p>
//         </div>
//       </div>
//     );
//   }

//   const {
//     trainingPlans,
//     progressStats,
//     nextTraining,
//     coachNotes,
//     achievements,
//   } = dashboardData;

//   const completedTrainings = trainingPlans.filter(training => training.completed);
//   const queueTrainings = trainingPlans.filter(training => !training.completed);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 🥅 Футбольний Дашборд
//               </h1>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="text-right">
//                 <p className="text-sm font-medium text-gray-900">
//                   {session.user?.name}
//                 </p>
//                 <p className="text-sm text-gray-500">Учень</p>
//               </div>
//               <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {session.user?.name?.charAt(0) || "У"}
//               </div>
//               <button
//                 onClick={() => signOut()}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
//               >
//                 Вийти
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
//             Вітаю, {session.user?.name}! ⚽
//           </h2>
//           <p className="text-gray-600">Твій прогрес та наступні тренування</p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {progressStats.map((stat) => (
//             <div
//               key={stat.id}
//               className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-2xl">{stat.icon}</div>
//                 <span
//                   className={`text-sm font-medium ${
//                     stat.current > stat.previous
//                       ? "text-green-600"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {stat.current > stat.previous ? "+" : ""}
//                   {stat.current - stat.previous}%
//                 </span>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-1">
//                 {stat.current}%
//               </h3>
//               <p className="text-gray-600 text-sm">{stat.skill}</p>
//               <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//                 <div
//                   className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
//                   style={{ width: `${stat.current}%` }}
//                 ></div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Training Queue & Archive */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Training Queue */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     ⏳ Тренування в черзі
//                   </h3>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Заплановані тренування, які чекають на виконання
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
//                     {queueTrainings.length} в черзі
//                   </span>
//                 </div>
//               </div>

//               {paginatedQueueTrainings.length === 0 ? (
//                 <div className="text-center py-8">
//                   <div className="text-4xl mb-4">✅</div>
//                   <h4 className="text-lg font-semibold text-gray-900 mb-2">
//                     Черга порожня
//                   </h4>
//                   <p className="text-gray-600">
//                     Всі тренування виконані! Очікуйте на нові завдання від тренера
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="space-y-4">
//                     {paginatedQueueTrainings.map((training) => (
//                       <div
//                         key={training.id}
//                         className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-md transition-shadow duration-200"
//                       >
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex-1">
//                             <div className="flex items-center space-x-3 mb-2">
//                               <div
//                                 className={`w-3 h-3 rounded-full ${getIntensityColor(training.intensity)}`}
//                               ></div>
//                               <h4 className="font-semibold text-gray-900 text-lg">
//                                 {training.title}
//                               </h4>
//                             </div>
                            
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
//                               <div className="flex items-center space-x-1">
//                                 <span>⏱️</span>
//                                 <span>{training.duration}</span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <span>⚡</span>
//                                 <span>{getIntensityText(training.intensity)}</span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <span>📅</span>
//                                 <span>{formatDate(training.date)}</span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <span>🕒</span>
//                                 <span className="text-orange-600 font-medium">В черзі</span>
//                               </div>
//                             </div>

//                             {training.exercises && training.exercises.length > 0 && (
//                               <div>
//                                 <h5 className="font-medium text-gray-700 mb-2 text-sm">
//                                   Заплановані вправи:
//                                 </h5>
//                                 <div className="flex flex-wrap gap-2">
//                                   {training.exercises.map((exercise, index) => (
//                                     <span
//                                       key={index}
//                                       className="bg-white text-orange-700 px-2 py-1 rounded text-xs border border-orange-200"
//                                     >
//                                       {exercise}
//                                     </span>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
                        
//                         <div className="flex justify-end">
//                           <button
//                             onClick={() => updateTrainingStatus(training.id, true)}
//                             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//                           >
//                             ✅ Завершити тренування
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Пагінація для черги */}
//                   {totalQueuePages > 1 && (
//                     <div className="flex justify-center items-center space-x-2 mt-6">
//                       <button
//                         onClick={() => setCurrentQueuePage(prev => Math.max(prev - 1, 1))}
//                         disabled={currentQueuePage === 1}
//                         className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                       >
//                         ←
//                       </button>
                      
//                       {Array.from({ length: totalQueuePages }, (_, i) => i + 1).map(page => (
//                         <button
//                           key={page}
//                           onClick={() => setCurrentQueuePage(page)}
//                           className={`px-3 py-1 rounded-lg ${
//                             currentQueuePage === page
//                               ? 'bg-orange-500 text-white'
//                               : 'border border-gray-300 hover:bg-gray-50'
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       ))}
                      
//                       <button
//                         onClick={() => setCurrentQueuePage(prev => Math.min(prev + 1, totalQueuePages))}
//                         disabled={currentQueuePage === totalQueuePages}
//                         className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                       >
//                         →
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             {/* Training Archive */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     📚 Архів тренувань
//                   </h3>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Показано {paginatedArchiveTrainings.length} з {completedTrainings.length} тренувань
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                     {completedTrainings.length} завершених
//                   </span>
//                   <button
//                     onClick={() => router.push("/archive")}
//                     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//                   >
//                     Весь архів
//                   </button>
//                 </div>
//               </div>

//               {paginatedArchiveTrainings.length === 0 ? (
//                 <div className="text-center py-8">
//                   <div className="text-4xl mb-4">📝</div>
//                   <h4 className="text-lg font-semibold text-gray-900 mb-2">
//                     Архів порожній
//                   </h4>
//                   <p className="text-gray-600">
//                     Тут будуть відображатися всі завершені тренування
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="space-y-4">
//                     {paginatedArchiveTrainings.map((training) => (
//                       <div
//                         key={training.id}
//                         className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200"
//                       >
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex-1">
//                             <div className="flex items-center space-x-3 mb-2">
//                               <div
//                                 className={`w-3 h-3 rounded-full ${getIntensityColor(training.intensity)}`}
//                               ></div>
//                               <h4 className="font-semibold text-gray-900 text-lg">
//                                 {training.title}
//                               </h4>
//                             </div>
                            
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
//                               <div className="flex items-center space-x-1">
//                                 <span>⏱️</span>
//                                 <span>{training.duration}</span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <span>⚡</span>
//                                 <span>{getIntensityText(training.intensity)}</span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <span>📅</span>
//                                 <span>{formatDate(training.completedDate || training.date)}</span>
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <span>✅</span>
//                                 <span className="text-green-600 font-medium">Завершено</span>
//                               </div>
//                             </div>

//                             {training.exercises && training.exercises.length > 0 && (
//                               <div>
//                                 <h5 className="font-medium text-gray-700 mb-2 text-sm">
//                                   Виконані вправи:
//                                 </h5>
//                                 <div className="flex flex-wrap gap-2">
//                                   {training.exercises.map((exercise, index) => (
//                                     <span
//                                       key={index}
//                                       className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200"
//                                     >
//                                       {exercise}
//                                     </span>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Пагінація для архіву */}
//                   {totalArchivePages > 1 && (
//                     <div className="flex justify-center items-center space-x-2 mt-6">
//                       <button
//                         onClick={() => setCurrentArchivePage(prev => Math.max(prev - 1, 1))}
//                         disabled={currentArchivePage === 1}
//                         className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                       >
//                         ←
//                       </button>
                      
//                       {Array.from({ length: totalArchivePages }, (_, i) => i + 1).map(page => (
//                         <button
//                           key={page}
//                           onClick={() => setCurrentArchivePage(page)}
//                           className={`px-3 py-1 rounded-lg ${
//                             currentArchivePage === page
//                               ? 'bg-green-500 text-white'
//                               : 'border border-gray-300 hover:bg-gray-50'
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       ))}
                      
//                       <button
//                         onClick={() => setCurrentArchivePage(prev => Math.min(prev + 1, totalArchivePages))}
//                         disabled={currentArchivePage === totalArchivePages}
//                         className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                       >
//                         →
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* Статистика архіву */}
//               {completedTrainings.length > 0 && (
//                 <div className="mt-6 pt-4 border-t border-gray-200">
//                   <h4 className="font-semibold text-gray-900 mb-3">Статистика архіву</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//                     <div className="bg-blue-50 rounded-lg p-3">
//                       <div className="text-2xl font-bold text-blue-600">{completedTrainings.length}</div>
//                       <div className="text-xs text-blue-800">Всього тренувань</div>
//                     </div>
//                     <div className="bg-green-50 rounded-lg p-3">
//                       <div className="text-2xl font-bold text-green-600">
//                         {Math.round((completedTrainings.length / trainingPlans.length) * 100)}%
//                       </div>
//                       <div className="text-xs text-green-800">Успішність</div>
//                     </div>
//                     <div className="bg-yellow-50 rounded-lg p-3">
//                       <div className="text-2xl font-bold text-yellow-600">
//                         {completedTrainings.filter(t => t.intensity === "high").length}
//                       </div>
//                       <div className="text-xs text-yellow-800">Високої інтенсивності</div>
//                     </div>
//                     <div className="bg-purple-50 rounded-lg p-3">
//                       <div className="text-2xl font-bold text-purple-600">
//                         {new Set(completedTrainings.flatMap(t => t.exercises)).size}
//                       </div>
//                       <div className="text-xs text-purple-800">Унікальних вправ</div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Quick Actions - ВСІ ФУНКЦІОНАЛИ ЗАЛИШЕНІ */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">
//                 Швидкі дії
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   onClick={() => router.push("/statistics")}
//                   className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200"
//                 >
//                   <span className="text-2xl">📈</span>
//                   <span className="text-left">
//                     <div className="font-medium text-gray-900">Статистика</div>
//                     <div className="text-sm text-gray-500">Мій прогрес</div>
//                   </span>
//                 </button>

//                 <button 
//                   className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200"
//                   onClick={() => router.push("/goals")}
//                 >
//                   <span className="text-2xl">🎯</span>
//                   <span className="text-left">
//                     <div className="font-medium text-gray-900">Цілі</div>
//                     <div className="text-sm text-gray-500">Мої цілі</div>
//                   </span>
//                 </button>


//                 <button
//                   onClick={() => router.push("/chat")} 
//                   className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
//                 >
//                   <span className="text-2xl">👨‍🏫</span>
//                   <span className="text-left">
//                     <div className="font-medium text-gray-900">Тренер</div>
//                     <div className="text-sm text-gray-500">Звʼязатись</div>
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Next Training & Coach Notes & Achievements - ВСЕ ЗАЛИШЕНО */}
//           <div className="space-y-8">
//             {/* Next Training */}
//             <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
//               <h3 className="text-lg font-semibold mb-4">
//                 Наступне тренування
//               </h3>
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-green-100">Дата:</span>
//                   <span className="font-semibold">{nextTraining.date}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-green-100">Час:</span>
//                   <span className="font-semibold">{nextTraining.time}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-green-100">Тип:</span>
//                   <span className="font-semibold">{nextTraining.type}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-green-100">Фокус:</span>
//                   <span className="font-semibold">{nextTraining.focus}</span>
//                 </div>
//               </div>

//               <button className="w-full mt-6 bg-white text-green-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
//                 Підготуватись до тренування
//               </button>
//             </div>

//             {/* Coach Notes */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">
//                 <span className="flex items-center">
//                   <span className="mr-2">👨‍🏫</span>
//                   Рекомендації тренера
//                 </span>
//               </h3>
//               <div className="space-y-3">
//                 {coachNotes.map((note) => (
//                   <div
//                     key={note.id}
//                     className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
//                   >
//                     <span className="text-yellow-500 mt-0.5">💡</span>
//                     <p className="text-sm text-yellow-800">{note.note}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Achievements */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">
//                 🏆 Досягнення
//               </h3>
//               <div className="grid grid-cols-3 gap-4 text-center">
//                 {achievements.length > 0 ? (
//                   achievements.map((achievement) => (
//                     <div
//                       key={achievement.id}
//                       className={`p-3 ${
//                         achievement.color === "green"
//                           ? "bg-green-50"
//                           : achievement.color === "blue"
//                           ? "bg-blue-50"
//                           : "bg-purple-50"
//                       } rounded-lg`}
//                     >
//                       <div className="text-2xl mb-1">{achievement.icon}</div>
//                       <div className="text-xs text-gray-600">
//                         {achievement.title}
//                       </div>
//                       <div
//                         className={`font-bold ${
//                           achievement.color === "green"
//                             ? "text-green-600"
//                             : achievement.color === "blue"
//                             ? "text-blue-600"
//                             : "text-purple-600"
//                         }`}
//                       >
//                         {achievement.value}
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="col-span-3 text-center py-4">
//                     <p className="text-gray-500 text-sm">
//                       Поки що немає досягнень
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-white border-t mt-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <p className="text-gray-500 text-sm">
//               © 2024 Футбольна академія. Твій шлях до успіху!
//             </p>
//             <div className="flex space-x-6">
//               <button className="text-gray-500 hover:text-gray-700 text-sm">
//                 Розклад
//               </button>
//               <button className="text-gray-500 hover:text-gray-700 text-sm">
//                 Допомога
//               </button>
//               <button className="text-gray-500 hover:text-gray-700 text-sm">
//                 Тренер
//               </button>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

"use client";
import { useSession, signOut } from "next-auth/react";
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

interface ProgressStats {
  id: string;
  userId: string;
  skill: string;
  current: number;
  previous: number;
  icon: string;
}

interface NextTraining {
  id: string;
  date: string;
  time: string;
  type: string;
  focus: string;
  trainingPlanId?: string;
}

interface CoachNote {
  id: string;
  note: string;
}

interface Achievement {
  id: string;
  userId: string;
  icon: string;
  title: string;
  value: string;
  color: string;
}

interface DashboardData {
  trainingPlans: TrainingPlan[];
  progressStats: ProgressStats[];
  nextTraining: NextTraining;
  coachNotes: CoachNote[];
  achievements: Achievement[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentArchivePage, setCurrentArchivePage] = useState(1);
  const [currentQueuePage, setCurrentQueuePage] = useState(1);
  const trainingsPerPage = 5;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error("Користувач не авторизований");
      }

      // Використовуємо наші нові API endpoints
      const [trainingPlansRes, progressStatsRes, nextTrainingsRes, coachNotesRes, achievementsRes] = await Promise.all([
        fetch('/api/trainings/user'),
        fetch('/api/progress-stats'),
        fetch('/api/next-trainings'),
        fetch('/api/coach-notes'),
        fetch('/api/achievements')
      ]);

      if (!trainingPlansRes.ok || !progressStatsRes.ok) {
        throw new Error('Не вдалося завантажити дані');
      }

      const trainingPlans = await trainingPlansRes.json();
      const progressStats = await progressStatsRes.json();
      const nextTrainings = nextTrainingsRes.ok ? await nextTrainingsRes.json() : [];
      const coachNotes = coachNotesRes.ok ? await coachNotesRes.json() : [];
      const achievements = achievementsRes.ok ? await achievementsRes.json() : [];

      // Трансформуємо дані для сумісності з існуючим інтерфейсом
      const transformedTrainingPlans: TrainingPlan[] = trainingPlans.map((session: any) => ({
        id: session.id,
        title: `Тренування ${session.date}`,
        duration: session.duration,
        intensity: "medium" as const,
        completed: session.completed,
        exercises: session.coachNotes ? [session.coachNotes] : [],
        assignedTo: [session.userId],
        date: session.date,
        completedDate: session.completed ? session.date : undefined,
        performance: session.performance
      }));

      // Отримуємо наступне тренування (перше з масиву)
      const nextTraining: NextTraining = nextTrainings.length > 0 ? nextTrainings[0] : {
        id: "1",
        date: "Не встановлено",
        time: "",
        type: "",
        focus: "",
      };

      setDashboardData({
        trainingPlans: transformedTrainingPlans,
        progressStats: progressStats,
        nextTraining,
        coachNotes,
        achievements,
      });
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
      setError("Не вдалося завантажити дані. Спробуйте пізніше.");
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
      fetchDashboardData();
    }
  }, [status, session, router]);

  // Функція для оновлення статусу тренування
  const updateTrainingStatus = async (trainingId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/training-sessions/${trainingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        // Оновлюємо локальний стан
        setDashboardData((prev) =>
          prev
            ? {
                ...prev,
                trainingPlans: prev.trainingPlans.map((training) =>
                  training.id === trainingId
                    ? { ...training, completed, completedDate: completed ? new Date().toISOString().split('T')[0] : undefined }
                    : training
                ),
              }
            : null
        );
      }
    } catch (err) {
      console.error("Помилка оновлення тренування:", err);
    }
  };

  // Функція для форматування дати
  const formatDate = (dateString: string) => {
    if (dateString === "Не встановлено") return dateString;
    
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

  // Пагінація для архіву
  const getPaginatedArchiveTrainings = () => {
    if (!dashboardData) return [];
    
    const completedTrainings = dashboardData.trainingPlans.filter(training => training.completed);
    const sortedCompletedTrainings = [...completedTrainings].sort((a, b) => 
      new Date(b.completedDate || b.date).getTime() - new Date(a.completedDate || a.date).getTime()
    );

    const startIndex = (currentArchivePage - 1) * trainingsPerPage;
    const endIndex = startIndex + trainingsPerPage;
    
    return sortedCompletedTrainings.slice(startIndex, endIndex);
  };

  // Пагінація для тренувань в черзі
  const getPaginatedQueueTrainings = () => {
    if (!dashboardData) return [];
    
    const queueTrainings = dashboardData.trainingPlans.filter(training => !training.completed);
    const sortedQueueTrainings = [...queueTrainings].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const startIndex = (currentQueuePage - 1) * trainingsPerPage;
    const endIndex = startIndex + trainingsPerPage;
    
    return sortedQueueTrainings.slice(startIndex, endIndex);
  };

  const getTotalArchivePages = () => {
    if (!dashboardData) return 0;
    const completedTrainings = dashboardData.trainingPlans.filter(training => training.completed);
    return Math.ceil(completedTrainings.length / trainingsPerPage);
  };

  const getTotalQueuePages = () => {
    if (!dashboardData) return 0;
    const queueTrainings = dashboardData.trainingPlans.filter(training => !training.completed);
    return Math.ceil(queueTrainings.length / trainingsPerPage);
  };

  const paginatedArchiveTrainings = getPaginatedArchiveTrainings();
  const paginatedQueueTrainings = getPaginatedQueueTrainings();
  const totalArchivePages = getTotalArchivePages();
  const totalQueuePages = getTotalQueuePages();

  if (status === "loading" || loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">😔</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Дані не знайдені</p>
        </div>
      </div>
    );
  }

  const {
    trainingPlans,
    progressStats,
    nextTraining,
    coachNotes,
    achievements,
  } = dashboardData;

  const completedTrainings = trainingPlans.filter(training => training.completed);
  const queueTrainings = trainingPlans.filter(training => !training.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🥅 Футбольний Дашборд
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
          {progressStats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{stat.icon}</div>
                <span
                  className={`text-sm font-medium ${
                    stat.current > stat.previous
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.current > stat.previous ? "+" : ""}
                  {stat.current - stat.previous}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.current}%
              </h3>
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
          {/* Left Column - Training Queue & Archive */}
          <div className="lg:col-span-2 space-y-8">
            {/* Training Queue */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    ⏳ Тренування в черзі
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Заплановані тренування, які чекають на виконання
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {queueTrainings.length} в черзі
                  </span>
                </div>
              </div>

              {paginatedQueueTrainings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Черга порожня
                  </h4>
                  <p className="text-gray-600">
                    Всі тренування виконані! Очікуйте на нові завдання від тренера
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedQueueTrainings.map((training) => (
                      <div
                        key={training.id}
                        className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getIntensityColor(training.intensity)}`}
                              ></div>
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {training.title}
                              </h4>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <span>⏱️</span>
                                <span>{training.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>⚡</span>
                                <span>{getIntensityText(training.intensity)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>📅</span>
                                <span>{formatDate(training.date)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>🕒</span>
                                <span className="text-orange-600 font-medium">В черзі</span>
                              </div>
                            </div>

                            {training.exercises && training.exercises.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2 text-sm">
                                  Заплановані вправи:
                                </h5>
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
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={() => updateTrainingStatus(training.id, true)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            ✅ Завершити тренування
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Пагінація для черги */}
                  {totalQueuePages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                      <button
                        onClick={() => setCurrentQueuePage(prev => Math.max(prev - 1, 1))}
                        disabled={currentQueuePage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ←
                      </button>
                      
                      {Array.from({ length: totalQueuePages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentQueuePage(page)}
                          className={`px-3 py-1 rounded-lg ${
                            currentQueuePage === page
                              ? 'bg-orange-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentQueuePage(prev => Math.min(prev + 1, totalQueuePages))}
                        disabled={currentQueuePage === totalQueuePages}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Training Archive */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    📚 Архів тренувань
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Показано {paginatedArchiveTrainings.length} з {completedTrainings.length} тренувань
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {completedTrainings.length} завершених
                  </span>
                  <button
                    onClick={() => router.push("/archive")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Весь архів
                  </button>
                </div>
              </div>

              {paginatedArchiveTrainings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Архів порожній
                  </h4>
                  <p className="text-gray-600">
                    Тут будуть відображатися всі завершені тренування
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedArchiveTrainings.map((training) => (
                      <div
                        key={training.id}
                        className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getIntensityColor(training.intensity)}`}
                              ></div>
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {training.title}
                              </h4>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <span>⏱️</span>
                                <span>{training.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>⚡</span>
                                <span>{getIntensityText(training.intensity)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>📅</span>
                                <span>{formatDate(training.completedDate || training.date)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>✅</span>
                                <span className="text-green-600 font-medium">Завершено</span>
                              </div>
                            </div>

                            {training.exercises && training.exercises.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2 text-sm">
                                  Виконані вправи:
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {training.exercises.map((exercise, index) => (
                                    <span
                                      key={index}
                                      className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200"
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

                  {/* Пагінація для архіву */}
                  {totalArchivePages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                      <button
                        onClick={() => setCurrentArchivePage(prev => Math.max(prev - 1, 1))}
                        disabled={currentArchivePage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ←
                      </button>
                      
                      {Array.from({ length: totalArchivePages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentArchivePage(page)}
                          className={`px-3 py-1 rounded-lg ${
                            currentArchivePage === page
                              ? 'bg-green-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentArchivePage(prev => Math.min(prev + 1, totalArchivePages))}
                        disabled={currentArchivePage === totalArchivePages}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Статистика архіву */}
              {completedTrainings.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Статистика архіву</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{completedTrainings.length}</div>
                      <div className="text-xs text-blue-800">Всього тренувань</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((completedTrainings.length / trainingPlans.length) * 100)}%
                      </div>
                      <div className="text-xs text-green-800">Успішність</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-600">
                        {completedTrainings.filter(t => t.intensity === "high").length}
                      </div>
                      <div className="text-xs text-yellow-800">Високої інтенсивності</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(completedTrainings.flatMap(t => t.exercises)).size}
                      </div>
                      <div className="text-xs text-purple-800">Унікальних вправ</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Швидкі дії
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push("/statistics")}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200"
                >
                  <span className="text-2xl">📈</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Статистика</div>
                    <div className="text-sm text-gray-500">Мій прогрес</div>
                  </span>
                </button>

                <button 
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200"
                  onClick={() => router.push("/goals")}
                >
                  <span className="text-2xl">🎯</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Цілі</div>
                    <div className="text-sm text-gray-500">Мої цілі</div>
                  </span>
                </button>

                <button
                  onClick={() => router.push("/chat")} 
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
                >
                  <span className="text-2xl">👨‍🏫</span>
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Тренер</div>
                    <div className="text-sm text-gray-500">Звʼязатись</div>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Next Training & Coach Notes & Achievements */}
          <div className="space-y-8">
            {/* Next Training */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">
                Наступне тренування
              </h3>
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
                {coachNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <span className="text-yellow-500 mt-0.5">💡</span>
                    <p className="text-sm text-yellow-800">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                🏆 Досягнення
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 ${
                        achievement.color === "green"
                          ? "bg-green-50"
                          : achievement.color === "blue"
                          ? "bg-blue-50"
                          : "bg-purple-50"
                      } rounded-lg`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <div className="text-xs text-gray-600">
                        {achievement.title}
                      </div>
                      <div
                        className={`font-bold ${
                          achievement.color === "green"
                            ? "text-green-600"
                            : achievement.color === "blue"
                            ? "text-blue-600"
                            : "text-purple-600"
                        }`}
                      >
                        {achievement.value}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4">
                    <p className="text-gray-500 text-sm">
                      Поки що немає досягнень
                    </p>
                  </div>
                )}
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
              <button className="text-gray-500 hover:text-gray-700 text-sm">
                Розклад
              </button>
              <button className="text-gray-500 hover:text-gray-700 text-sm">
                Допомога
              </button>
              <button className="text-gray-500 hover:text-gray-700 text-sm">
                Тренер
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}