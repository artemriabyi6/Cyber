// "use client";
// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
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

// interface NextTraining {
//   id: string;
//   userId: string;
//   date: string;
//   time: string;
//   type: string;
//   focus: string;
//   trainingPlanId?: string;
// }

// interface CoachStats {
//   totalStudents: number;
//   completedTrainings: number;
//   upcomingTrainings: number;
//   averagePerformance: number;
// }

// export default function CoachDashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState("overview");
//   const [students, setStudents] = useState<User[]>([]);
//   const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
//   const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(
//     []
//   );
//   const [nextTrainings, setNextTrainings] = useState<NextTraining[]>([]);
//   const [stats, setStats] = useState<CoachStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showAddTraining, setShowAddTraining] = useState(false);
//   const [showSetNextTraining, setShowSetNextTraining] = useState(false);
//   const [showEditTraining, setShowEditTraining] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
//   const [selectedTraining, setSelectedTraining] = useState<TrainingPlan | null>(
//     null
//   );
//   const [error, setError] = useState<string | null>(null);

//   // Форма для нового тренування
//   const [newTraining, setNewTraining] = useState({
//     title: "",
//     duration: "",
//     intensity: "medium",
//     exercises: [""],
//     assignedTo: [] as string[],
//     date: "",
//   });

//   // Форма для редагування тренування
//   const [editTraining, setEditTraining] = useState({
//     id: "",
//     title: "",
//     duration: "",
//     intensity: "medium",
//     exercises: [""],
//     assignedTo: [] as string[],
//     date: "",
//     completed: false,
//   });

//   // Форма для наступного тренування
//   const [nextTrainingForm, setNextTrainingForm] = useState({
//     date: "",
//     time: "",
//     type: "",
//     focus: "",
//     trainingPlanId: "",
//   });

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/signin");
//     } else if (status === "authenticated") {
//       if (session.user?.role !== "coach") {
//         router.push("/dashboard");
//         return;
//       }
//       fetchCoachData();
//     }
//   }, [status, session]);

//   const fetchCoachData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       console.log("Завантаження даних тренера...");

//       const [studentsRes, trainingPlansRes, sessionsRes, nextTrainingsRes] =
//         await Promise.all([
//           fetch("http://localhost:3001/users?role=student"),
//           fetch("http://localhost:3001/trainingPlans"),
//           fetch("http://localhost:3001/trainingSessions"),
//           fetch("http://localhost:3001/nextTrainings"),
//         ]);

//       if (!studentsRes.ok) {
//         throw new Error(`Помилка завантаження учнів: ${studentsRes.status}`);
//       }
//       if (!trainingPlansRes.ok) {
//         throw new Error(
//           `Помилка завантаження тренувань: ${trainingPlansRes.status}`
//         );
//       }

//       const [studentsData, trainingPlansData] = await Promise.all([
//         studentsRes.json(),
//         trainingPlansRes.json(),
//       ]);

//       let sessionsData: TrainingSession[] = [];
//       if (sessionsRes.ok) {
//         sessionsData = await sessionsRes.json();
//       }

//       let nextTrainingsData: NextTraining[] = [];
//       if (nextTrainingsRes.ok) {
//         nextTrainingsData = await nextTrainingsRes.json();
//       }

//       console.log("Завантажено:", {
//         students: studentsData.length,
//         trainingPlans: trainingPlansData.length,
//         sessions: sessionsData.length,
//         nextTrainings: nextTrainingsData.length,
//       });

//       setStudents(studentsData);
//       setTrainingPlans(trainingPlansData);
//       setTrainingSessions(sessionsData);
//       setNextTrainings(nextTrainingsData);

//       // Розрахунок статистики
//       const coachStats: CoachStats = {
//         totalStudents: studentsData.length,
//         completedTrainings: sessionsData.filter(
//           (s: TrainingSession) => s.completed
//         ).length,
//         upcomingTrainings: trainingPlansData.filter(
//           (t: TrainingPlan) => !t.completed
//         ).length,
//         averagePerformance:
//           sessionsData.length > 0
//             ? sessionsData.reduce(
//                 (acc: number, session: TrainingSession) =>
//                   acc + session.performance,
//                 0
//               ) / sessionsData.length
//             : 0,
//       };

//       setStats(coachStats);
//     } catch (error) {
//       console.error("Помилка завантаження даних:", error);
//       setError(error instanceof Error ? error.message : "Невідома помилка");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Функція для додавання тренування
//   const addTraining = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setError(null);

//       if (!newTraining.title.trim()) {
//         setError("Будь ласка, введіть назву тренування");
//         return;
//       }
//       if (!newTraining.date) {
//         setError("Будь ласка, виберіть дату");
//         return;
//       }
//       if (newTraining.assignedTo.length === 0) {
//         setError("Будь ласка, виберіть хоча б одного учня");
//         return;
//       }

//       const trainingData = {
//         id: Date.now().toString(),
//         title: newTraining.title.trim(),
//         duration: newTraining.duration || "45 хв",
//         intensity: newTraining.intensity,
//         exercises: newTraining.exercises.filter((ex) => ex.trim() !== ""),
//         assignedTo: newTraining.assignedTo,
//         createdBy: session?.user?.id,
//         date: newTraining.date,
//         completed: false,
//       };

   

//       const response = await fetch("http://localhost:3001/trainingPlans", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(trainingData),
//       });

//       if (!response.ok) {
//         throw new Error(`Помилка сервера: ${response.status}`);
//       }

//       const createdTraining = await response.json();
//       console.log("Тренування створено:", createdTraining);

//       setShowAddTraining(false);
//       setNewTraining({
//         title: "",
//         duration: "",
//         intensity: "medium",
//         exercises: [""],
//         assignedTo: [],
//         date: "",
//       });

//       fetchCoachData();
//     } catch (error) {
//       console.error("Помилка додавання тренування:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Помилка при додаванні тренування"
//       );
//     }
//   };

//   // Функція для редагування тренування
//   const updateTraining = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setError(null);

//       if (!editTraining.title.trim()) {
//         setError("Будь ласка, введіть назву тренування");
//         return;
//       }
//       if (!editTraining.date) {
//         setError("Будь ласка, виберіть дату");
//         return;
//       }
//       if (editTraining.assignedTo.length === 0) {
//         setError("Будь ласка, виберіть хоча б одного учня");
//         return;
//       }

//       const trainingData = {
//         title: editTraining.title.trim(),
//         duration: editTraining.duration || "45 хв",
//         intensity: editTraining.intensity,
//         exercises: editTraining.exercises.filter((ex) => ex.trim() !== ""),
//         assignedTo: editTraining.assignedTo,
//         date: editTraining.date,
//         completed: editTraining.completed,
//       };

//       console.log("Оновлюємо тренування:", trainingData);

//       const response = await fetch(
//         `http://localhost:3001/trainingPlans/${editTraining.id}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(trainingData),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Помилка сервера: ${response.status}`);
//       }

//       const updatedTraining = await response.json();
//       console.log("Тренування оновлено:", updatedTraining);

//       setShowEditTraining(false);
//       setEditTraining({
//         id: "",
//         title: "",
//         duration: "",
//         intensity: "medium",
//         exercises: [""],
//         assignedTo: [],
//         date: "",
//         completed: false,
//       });

//       fetchCoachData();
//     } catch (error) {
//       console.error("Помилка редагування тренування:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Помилка при редагуванні тренування"
//       );
//     }
//   };

//   // Функція для відкриття форми редагування
//   const openEditTraining = (training: TrainingPlan) => {
//     setSelectedTraining(training);
//     setEditTraining({
//       id: training.id,
//       title: training.title,
//       duration: training.duration,
//       intensity: training.intensity,
//       exercises: training.exercises.length > 0 ? training.exercises : [""],
//       assignedTo: training.assignedTo,
//       date: training.date,
//       completed: training.completed,
//     });
//     setShowEditTraining(true);
//   };

//   // Функція для видалення тренування
//   const deleteTraining = async (trainingId: string) => {
//     if (!confirm("Ви впевнені, що хочете видалити це тренування?")) return;

//     try {
//       setError(null);

//       const response = await fetch(
//         `http://localhost:3001/trainingPlans/${trainingId}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Помилка видалення: ${response.status}`);
//       }

//       console.log("Тренування видалено:", trainingId);
//       fetchCoachData();
//     } catch (error) {
//       console.error("Помилка видалення тренування:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Помилка при видаленні тренування"
//       );
//     }
//   };

//   // Функція для відмітки тренування як завершеного для всіх учнів
//   const markTrainingCompleted = async (trainingId: string) => {
//     try {
//       setError(null);

//       const training = trainingPlans.find((t) => t.id === trainingId);
//       if (!training) return;

//       // Створюємо сесії тренування для кожного учня
//       const sessionPromises = training.assignedTo.map(async (userId) => {
//         const sessionData = {
//           id: Date.now() + Math.random().toString(),
//           trainingPlanId: trainingId,
//           userId: userId,
//           date: new Date().toISOString().split("T")[0],
//           duration: training.duration,
//           performance: Math.floor(Math.random() * 30) + 70,
//           coachNotes: "Тренування успішно завершено",
//           completed: true,
//         };

//         return fetch("http://localhost:3001/trainingSessions", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(sessionData),
//         });
//       });

//       await Promise.all(sessionPromises);

//       // Оновлюємо тренування як завершене
//       const trainingResponse = await fetch(
//         `http://localhost:3001/trainingPlans/${trainingId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             completed: true,
//             completedDate: new Date().toISOString().split("T")[0],
//           }),
//         }
//       );

//       if (!trainingResponse.ok) {
//         throw new Error(
//           `Помилка оновлення тренування: ${trainingResponse.status}`
//         );
//       }

//       console.log("Тренування відмічено як завершене для всіх учнів");
//       fetchCoachData();
//     } catch (error) {
//       console.error("Помилка відмітки тренування:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Помилка при відмітці тренування"
//       );
//     }
//   };

//   // Функція для відмітки тренування як незавершеного
//   const markTrainingIncomplete = async (trainingId: string) => {
//     try {
//       setError(null);

//       // Видаляємо сесії тренування, пов'язані з цим планом
//       const sessionsToDelete = trainingSessions.filter(
//         (session) => session.trainingPlanId === trainingId
//       );

//       const deletePromises = sessionsToDelete.map((session) =>
//         fetch(`http://localhost:3001/trainingSessions/${session.id}`, {
//           method: "DELETE",
//         })
//       );

//       await Promise.all(deletePromises);

//       // Оновлюємо тренування як незавершене
//       const trainingResponse = await fetch(
//         `http://localhost:3001/trainingPlans/${trainingId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             completed: false,
//             completedDate: null,
//           }),
//         }
//       );

//       if (!trainingResponse.ok) {
//         throw new Error(
//           `Помилка оновлення тренування: ${trainingResponse.status}`
//         );
//       }

//       console.log("Тренування відмічено як незавершене");
//       fetchCoachData();
//     } catch (error) {
//       console.error("Помилка відмітки тренування:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Помилка при відмітці тренування"
//       );
//     }
//   };

//   // НОВА ФУНКЦІЯ: Встановлення наступного тренування
//   const setNextTraining = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedStudent) return;

//     try {
//       setError(null);

//       if (
//         !nextTrainingForm.date ||
//         !nextTrainingForm.time ||
//         !nextTrainingForm.type
//       ) {
//         setError("Будь ласка, заповніть обов'язкові поля");
//         return;
//       }

//       const nextTrainingData = {
//         id: Date.now().toString(),
//         userId: selectedStudent.id,
//         date: nextTrainingForm.date,
//         time: nextTrainingForm.time,
//         type: nextTrainingForm.type,
//         focus: nextTrainingForm.focus,
//         trainingPlanId: nextTrainingForm.trainingPlanId || undefined,
//       };

//       console.log("Встановлюємо наступне тренування:", nextTrainingData);

//       const existingNextTraining = nextTrainings.find(
//         (nt) => nt.userId === selectedStudent.id
//       );

//       let response;
//       if (existingNextTraining) {
//         response = await fetch(
//           `http://localhost:3001/nextTrainings/${existingNextTraining.id}`,
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(nextTrainingData),
//           }
//         );
//       } else {
//         response = await fetch("http://localhost:3001/nextTrainings", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(nextTrainingData),
//         });
//       }

//       if (!response.ok) {
//         throw new Error(`Помилка сервера: ${response.status}`);
//       }

//       console.log("Наступне тренування встановлено");
//       setShowSetNextTraining(false);
//       setSelectedStudent(null);
//       setNextTrainingForm({
//         date: "",
//         time: "",
//         type: "",
//         focus: "",
//         trainingPlanId: "",
//       });

//       fetchCoachData();
//     } catch (error) {
//       console.error("Помилка встановлення тренування:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Помилка при встановленні тренування"
//       );
//     }
//   };

//   // НОВА ФУНКЦІЯ: Видалення наступного тренування
//   const removeNextTraining = async (studentId: string) => {
//     try {
//       setError(null);

//       const nextTraining = nextTrainings.find((nt) => nt.userId === studentId);
//       if (!nextTraining) return;

//       const response = await fetch(
//         `http://localhost:3001/nextTrainings/${nextTraining.id}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Помилка видалення: ${response.status}`);
//       }

//       console.log("Наступне тренування видалено");
//       fetchCoachData();
//     } catch (error) {
//       console.error("Помилка видалення тренування:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Помилка при видаленні тренування"
//       );
//     }
//   };

//   // НОВА ФУНКЦІЯ: Відкриття форми для встановлення наступного тренування
//   const openSetNextTraining = (student: User) => {
//     setSelectedStudent(student);

//     const existingNextTraining = nextTrainings.find(
//       (nt) => nt.userId === student.id
//     );
//     if (existingNextTraining) {
//       setNextTrainingForm({
//         date: existingNextTraining.date,
//         time: existingNextTraining.time,
//         type: existingNextTraining.type,
//         focus: existingNextTraining.focus,
//         trainingPlanId: existingNextTraining.trainingPlanId || "",
//       });
//     } else {
//       setNextTrainingForm({
//         date: "",
//         time: "",
//         type: "",
//         focus: "",
//         trainingPlanId: "",
//       });
//     }

//     setShowSetNextTraining(true);
//   };

//   // Функції для роботи з вправами
//   const addExerciseField = (isEdit = false) => {
//     if (isEdit) {
//       setEditTraining({
//         ...editTraining,
//         exercises: [...editTraining.exercises, ""],
//       });
//     } else {
//       setNewTraining({
//         ...newTraining,
//         exercises: [...newTraining.exercises, ""],
//       });
//     }
//   };

//   const updateExercise = (index: number, value: string, isEdit = false) => {
//     if (isEdit) {
//       const newExercises = [...editTraining.exercises];
//       newExercises[index] = value;
//       setEditTraining({
//         ...editTraining,
//         exercises: newExercises,
//       });
//     } else {
//       const newExercises = [...newTraining.exercises];
//       newExercises[index] = value;
//       setNewTraining({
//         ...newTraining,
//         exercises: newExercises,
//       });
//     }
//   };

//   const removeExercise = (index: number, isEdit = false) => {
//     if (isEdit) {
//       const newExercises = editTraining.exercises.filter((_, i) => i !== index);
//       setEditTraining({
//         ...editTraining,
//         exercises: newExercises.length > 0 ? newExercises : [""],
//       });
//     } else {
//       const newExercises = newTraining.exercises.filter((_, i) => i !== index);
//       setNewTraining({
//         ...newTraining,
//         exercises: newExercises.length > 0 ? newExercises : [""],
//       });
//     }
//   };

//   if (status === "loading" || loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Завантаження панелі тренера...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!session || session.user?.role !== "coach") {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 👨‍🏫 Панель тренера
//               </h1>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="text-right">
//                 <p className="text-sm font-medium text-gray-900">
//                   {session.user?.name}
//                 </p>
//                 <p className="text-sm text-gray-500">Тренер</p>
//               </div>
//               <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {session.user?.name?.charAt(0) || "Т"}
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
//             Вітаю, тренере {session.user?.name}! 🏆
//           </h2>
//           <p className="text-gray-600">
//             Керуйте тренуваннями та відстежуйте прогрес учнів
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

//         {/* Stats Grid */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-2xl">👥</div>
//                 <span className="text-sm font-medium text-green-600">
//                   +{stats.totalStudents}
//                 </span>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-1">
//                 {stats.totalStudents}
//               </h3>
//               <p className="text-gray-600 text-sm">Учнів</p>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-2xl">✅</div>
//                 <span className="text-sm font-medium text-green-600">
//                   +{stats.completedTrainings}
//                 </span>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-1">
//                 {stats.completedTrainings}
//               </h3>
//               <p className="text-gray-600 text-sm">Завершених тренувань</p>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-2xl">📅</div>
//                 <span className="text-sm font-medium text-blue-600">
//                   +{stats.upcomingTrainings}
//                 </span>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-1">
//                 {stats.upcomingTrainings}
//               </h3>
//               <p className="text-gray-600 text-sm">Майбутніх тренувань</p>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-2xl">📊</div>
//                 <span className="text-sm font-medium text-green-600">+12%</span>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-1">
//                 {stats.averagePerformance.toFixed(1)}%
//               </h3>
//               <p className="text-gray-600 text-sm">Середня успішність</p>
//             </div>
//           </div>
//         )}

//         {/* Navigation Tabs */}
//         <div className="bg-white rounded-xl shadow-sm border mb-8">
//           <div className="flex border-b">
//             <button
//               onClick={() => setActiveTab("overview")}
//               className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
//                 activeTab === "overview"
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               Огляд
//             </button>
//             <button
//               onClick={() => setActiveTab("trainings")}
//               className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
//                 activeTab === "trainings"
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               Тренування
//             </button>
//             <button
//               onClick={() => setActiveTab("students")}
//               className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
//                 activeTab === "students"
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               Учні
//             </button>
//           </div>

//           <div className="p-6">
//             {/* Overview Tab */}
//             {activeTab === "overview" && (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Recent Activity */}
//                 <div className="bg-gray-50 rounded-lg p-6">
//                   <h3 className="text-lg font-semibold mb-4">
//                     Остання активність
//                   </h3>
//                   <div className="space-y-4">
//                     {trainingSessions.slice(0, 5).map((session) => {
//                       const student = students.find(
//                         (s) => s.id === session.userId
//                       );
//                       const training = trainingPlans.find(
//                         (t) => t.id == session.trainingPlanId
//                       );
//                       return (
//                         <div
//                           key={session.id}
//                           className="flex items-center justify-between p-3 bg-white rounded-lg border"
//                         >
//                           <div>
//                             <p className="font-medium">
//                               {student?.name || "Невідомий учень"}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               {training?.title || "Невідоме тренування"}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                               {session.date}
//                             </p>
//                           </div>
//                           <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
//                             {session.performance}%
//                           </span>
//                         </div>
//                       );
//                     })}
//                     {trainingSessions.length === 0 && (
//                       <p className="text-gray-500 text-center py-4">
//                         Ще немає завершених тренувань
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Quick Actions */}
//                 <div className="bg-gray-50 rounded-lg p-6">
//                   <h3 className="text-lg font-semibold mb-4">Швидкі дії</h3>
//                   <div className="space-y-3">
//                     <button
//                       onClick={() => setShowAddTraining(true)}
//                       className="w-full text-left p-4 bg-white border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
//                     >
//                       <div className="font-medium text-gray-900">
//                         ➕ Додати тренування
//                       </div>
//                       <div className="text-sm text-gray-600">
//                         Створити нове тренування для учнів
//                       </div>
//                     </button>
//                     <button
//                       onClick={() => router.push("/statistics")}
//                       className="w-full text-left p-4 bg-white border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
//                     >
//                       <div className="font-medium text-gray-900">
//                         📊 Аналітика
//                       </div>
//                       <div className="text-sm text-gray-600">
//                         Переглянути статистику
//                       </div>
//                     </button>
//                     <button
//                       onClick={() => router.push("/chat")}
//                       className="w-full text-left flex items-center space-x-3 p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
//                     >
//                       <span className="text-2xl">👨‍🏫</span>
//                       <span className="text-left">
//                         <div className="font-medium text-gray-900">Тренер</div>
//                         <div className="text-sm text-gray-500">Звʼязатись</div>
//                       </span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Trainings Tab - ОНОВЛЕНА з кнопками редагування та відмітки */}
//             {activeTab === "trainings" && (
//               <div>
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-lg font-semibold">
//                     Усі тренування ({trainingPlans.length})
//                   </h3>
//                   <button
//                     onClick={() => setShowAddTraining(true)}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
//                   >
//                     ➕ Додати тренування
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {trainingPlans.map((training) => (
//                     <div
//                       key={training.id}
//                       className="bg-white border rounded-lg p-6"
//                     >
//                       <div className="flex justify-between items-start mb-4">
//                         <div>
//                           <h4 className="text-xl font-semibold text-gray-900">
//                             {training.title}
//                           </h4>
//                           <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
//                             <span>⏱️ {training.duration}</span>
//                             <span>⚡ {training.intensity}</span>
//                             <span>📅 {training.date}</span>
//                             <span
//                               className={`px-2 py-1 rounded ${
//                                 training.completed
//                                   ? "bg-green-100 text-green-800"
//                                   : "bg-yellow-100 text-yellow-800"
//                               }`}
//                             >
//                               {training.completed ? "Завершено" : "Заплановано"}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="flex space-x-2">
//                           <button
//                             onClick={() => openEditTraining(training)}
//                             className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                           >
//                             Редагувати
//                           </button>
//                           {!training.completed ? (
//                             <button
//                               onClick={() => markTrainingCompleted(training.id)}
//                               className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
//                             >
//                               Завершити
//                             </button>
//                           ) : (
//                             <button
//                               onClick={() =>
//                                 markTrainingIncomplete(training.id)
//                               }
//                               className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
//                             >
//                               Відновити
//                             </button>
//                           )}
//                           <button
//                             onClick={() => deleteTraining(training.id)}
//                             className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
//                           >
//                             Видалити
//                           </button>
//                         </div>
//                       </div>

//                       <div className="mb-4">
//                         <h5 className="font-medium mb-2">Вправи:</h5>
//                         <div className="flex flex-wrap gap-2">
//                           {training.exercises.map((exercise, index) => (
//                             <span
//                               key={index}
//                               className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
//                             >
//                               {exercise}
//                             </span>
//                           ))}
//                         </div>
//                       </div>

//                       <div>
//                         <h5 className="font-medium mb-2">Призначено для:</h5>
//                         <div className="flex flex-wrap gap-2">
//                           {training.assignedTo.map((studentId) => {
//                             const student = students.find(
//                               (s) => s.id === studentId
//                             );
//                             return (
//                               <span
//                                 key={studentId}
//                                 className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded"
//                               >
//                                 <span>
//                                   {student?.name || "Невідомий учень"}
//                                 </span>
//                               </span>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {trainingPlans.length === 0 && (
//                     <div className="text-center py-8">
//                       <p className="text-gray-500">Ще немає тренувань</p>
//                       <button
//                         onClick={() => setShowAddTraining(true)}
//                         className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
//                       >
//                         Створити перше тренування
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === "students" && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-6">
//                   Мої учні ({students.length})
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {students.map((student) => {
//                     const studentTrainings = trainingPlans.filter((t) =>
//                       t.assignedTo.includes(student.id)
//                     );
//                     const completedTrainings = studentTrainings.filter(
//                       (t) => t.completed
//                     ).length;
//                     const nextTraining = nextTrainings.find(
//                       (nt) => nt.userId === student.id
//                     );

//                     return (
//                       <div
//                         key={student.id}
//                         className="bg-white border rounded-lg p-6"
//                       >
//                         <div className="text-center">
//                           <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
//                             {student.name.charAt(0)}
//                           </div>
//                           <h4 className="font-semibold text-gray-900">
//                             {student.name}
//                           </h4>
//                           <p className="text-gray-600 text-sm mb-4">
//                             {student.email}
//                           </p>

//                           {/* НОВИЙ БЛОК: Наступне тренування */}
//                           {nextTraining && (
//                             <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
//                               <p className="text-sm font-medium text-green-800">
//                                 Наступне тренування
//                               </p>
//                               <p className="text-xs text-green-600">
//                                 {nextTraining.date} о {nextTraining.time}
//                               </p>
//                               <p className="text-xs text-green-600">
//                                 {nextTraining.type}
//                               </p>
//                               {nextTraining.focus && (
//                                 <p className="text-xs text-green-600">
//                                   Фокус: {nextTraining.focus}
//                                 </p>
//                               )}
//                               <button
//                                 onClick={() => removeNextTraining(student.id)}
//                                 className="text-xs text-red-500 hover:text-red-700 mt-1"
//                               >
//                                 Видалити
//                               </button>
//                             </div>
//                           )}

//                           <div className="grid grid-cols-2 gap-4 text-center">
//                             <div>
//                               <div className="text-2xl font-bold text-blue-600">
//                                 {studentTrainings.length}
//                               </div>
//                               <div className="text-xs text-gray-600">
//                                 Тренувань
//                               </div>
//                             </div>
//                             <div>
//                               <div className="text-2xl font-bold text-green-600">
//                                 {completedTrainings}
//                               </div>
//                               <div className="text-xs text-gray-600">
//                                 Завершено
//                               </div>
//                             </div>
//                           </div>

//                           <div className="flex space-x-2 mt-4">
//                             <button
//                               onClick={() => openSetNextTraining(student)}
//                               className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm transition-colors"
//                             >
//                               {nextTraining ? "Змінити" : "Встановити"}{" "}
//                               тренування
//                             </button>
//                             <button
//                               onClick={() =>
//                                 router.push(`/students/${student.id}`)
//                               }
//                               className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm transition-colors"
//                             >
//                               Профіль
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   {students.length === 0 && (
//                     <div className="col-span-3 text-center py-8">
//                       <p className="text-gray-500">Ще немає учнів</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Modal для додавання тренування - залишається незмінним */}
//       {showAddTraining && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold">
//                   Додати нове тренування
//                 </h3>
//                 <button
//                   onClick={() => setShowAddTraining(false)}
//                   className="text-gray-500 hover:text-gray-700 text-2xl"
//                 >
//                   ×
//                 </button>
//               </div>

//               <form onSubmit={addTraining}>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Назва тренування *
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={newTraining.title}
//                       onChange={(e) =>
//                         setNewTraining({
//                           ...newTraining,
//                           title: e.target.value,
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Наприклад: Техніка ведення м'яча"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Тривалість
//                       </label>
//                       <input
//                         type="text"
//                         value={newTraining.duration}
//                         onChange={(e) =>
//                           setNewTraining({
//                             ...newTraining,
//                             duration: e.target.value,
//                           })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="45 хв"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Дата *
//                       </label>
//                       <input
//                         type="date"
//                         required
//                         value={newTraining.date}
//                         onChange={(e) =>
//                           setNewTraining({
//                             ...newTraining,
//                             date: e.target.value,
//                           })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Складність
//                     </label>
//                     <select
//                       value={newTraining.intensity}
//                       onChange={(e) =>
//                         setNewTraining({
//                           ...newTraining,
//                           intensity: e.target.value,
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="low">Низька</option>
//                       <option value="medium">Середня</option>
//                       <option value="high">Висока</option>
//                     </select>
//                   </div>

//                   <div>
//                     <div className="flex justify-between items-center mb-1">
//                       <label className="block text-sm font-medium text-gray-700">
//                         Вправи
//                       </label>
//                       <button
//                         type="button"
//                         onClick={addExerciseField}
//                         className="text-blue-500 hover:text-blue-700 text-sm"
//                       >
//                         + Додати вправу
//                       </button>
//                     </div>
//                     <div className="space-y-2">
//                       {newTraining.exercises.map((exercise, index) => (
//                         <div key={index} className="flex gap-2">
//                           <input
//                             type="text"
//                             value={exercise}
//                             onChange={(e) =>
//                               updateExercise(index, e.target.value)
//                             }
//                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder={`Вправа ${index + 1}`}
//                           />
//                           {newTraining.exercises.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => removeExercise(index)}
//                               className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//                             >
//                               ×
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Призначити учням *
//                     </label>
//                     <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
//                       {students.map((student) => (
//                         <label
//                           key={student.id}
//                           className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={newTraining.assignedTo.includes(
//                               student.id
//                             )}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 setNewTraining({
//                                   ...newTraining,
//                                   assignedTo: [
//                                     ...newTraining.assignedTo,
//                                     student.id,
//                                   ],
//                                 });
//                               } else {
//                                 setNewTraining({
//                                   ...newTraining,
//                                   assignedTo: newTraining.assignedTo.filter(
//                                     (id) => id !== student.id
//                                   ),
//                                 });
//                               }
//                             }}
//                             className="rounded text-blue-500 focus:ring-blue-500"
//                           />
//                           <span>{student.name}</span>
//                           <span className="text-gray-500 text-sm">
//                             ({student.email})
//                           </span>
//                         </label>
//                       ))}
//                     </div>
//                     {newTraining.assignedTo.length === 0 && (
//                       <p className="text-red-500 text-sm mt-1">
//                         Виберіть хоча б одного учня
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex justify-end space-x-3 mt-6">
//                   <button
//                     type="button"
//                     onClick={() => setShowAddTraining(false)}
//                     className="px-4 py-2 text-gray-600 hover:text-gray-800"
//                   >
//                     Скасувати
//                   </button>
//                   <button
//                     type="submit"
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
//                   >
//                     Додати тренування
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* НОВИЙ MODAL: Для встановлення наступного тренування */}
//       {showSetNextTraining && selectedStudent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl max-w-md w-full">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold">
//                   Наступне тренування для {selectedStudent.name}
//                 </h3>
//                 <button
//                   onClick={() => setShowSetNextTraining(false)}
//                   className="text-gray-500 hover:text-gray-700 text-2xl"
//                 >
//                   ×
//                 </button>
//               </div>

//               <form onSubmit={setNextTraining}>
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Дата *
//                       </label>
//                       <input
//                         type="date"
//                         required
//                         value={nextTrainingForm.date}
//                         onChange={(e) =>
//                           setNextTrainingForm({
//                             ...nextTrainingForm,
//                             date: e.target.value,
//                           })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Час *
//                       </label>
//                       <input
//                         type="time"
//                         required
//                         value={nextTrainingForm.time}
//                         onChange={(e) =>
//                           setNextTrainingForm({
//                             ...nextTrainingForm,
//                             time: e.target.value,
//                           })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Тип тренування *
//                     </label>
//                     <select
//                       required
//                       value={nextTrainingForm.type}
//                       onChange={(e) =>
//                         setNextTrainingForm({
//                           ...nextTrainingForm,
//                           type: e.target.value,
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Оберіть тип</option>
//                       <option value="Індивідуальне">Індивідуальне</option>
//                       <option value="Групове">Групове</option>
//                       <option value="Технічне">Технічне</option>
//                       <option value="Тактичне">Тактичне</option>
//                       <option value="Фізична підготовка">
//                         Фізична підготовка
//                       </option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Фокус тренування
//                     </label>
//                     <input
//                       type="text"
//                       value={nextTrainingForm.focus}
//                       onChange={(e) =>
//                         setNextTrainingForm({
//                           ...nextTrainingForm,
//                           focus: e.target.value,
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Наприклад: Ударна техніка, Пасова гра..."
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Пов'язати з планом тренувань (необов'язково)
//                     </label>
//                     <select
//                       value={nextTrainingForm.trainingPlanId}
//                       onChange={(e) =>
//                         setNextTrainingForm({
//                           ...nextTrainingForm,
//                           trainingPlanId: e.target.value,
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Оберіть план тренувань</option>
//                       {trainingPlans
//                         .filter((t) =>
//                           t.assignedTo.includes(selectedStudent.id)
//                         )
//                         .map((training) => (
//                           <option key={training.id} value={training.id}>
//                             {training.title} ({training.date})
//                           </option>
//                         ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="flex justify-end space-x-3 mt-6">
//                   <button
//                     type="button"
//                     onClick={() => setShowSetNextTraining(false)}
//                     className="px-4 py-2 text-gray-600 hover:text-gray-800"
//                   >
//                     Скасувати
//                   </button>
//                   <button
//                     type="submit"
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
//                   >
//                     Встановити тренування
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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

interface NextTraining {
  id: string;
  userId: string;
  date: string;
  time: string;
  type: string;
  focus: string;
  trainingPlanId?: string;
}

interface CoachStats {
  totalStudents: number;
  completedTrainings: number;
  upcomingTrainings: number;
  averagePerformance: number;
}

export default function CoachDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState<User[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [nextTrainings, setNextTrainings] = useState<NextTraining[]>([]);
  const [stats, setStats] = useState<CoachStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [showSetNextTraining, setShowSetNextTraining] = useState(false);
  const [showEditTraining, setShowEditTraining] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrainingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Форма для нового тренування
  const [newTraining, setNewTraining] = useState({
    title: "",
    duration: "",
    intensity: "medium",
    exercises: [""],
    assignedTo: [] as string[],
    date: "",
  });

  // Форма для редагування тренування
  const [editTraining, setEditTraining] = useState({
    id: "",
    title: "",
    duration: "",
    intensity: "medium",
    exercises: [""],
    assignedTo: [] as string[],
    date: "",
    completed: false,
  });

  // Форма для наступного тренування
  const [nextTrainingForm, setNextTrainingForm] = useState({
    date: "",
    time: "",
    type: "",
    focus: "",
    trainingPlanId: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      if (session.user?.role !== "coach") {
        router.push("/dashboard");
        return;
      }
      fetchCoachData();
    }
  }, [status, session]);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Завантаження даних тренера...");

      // Використовуємо наші нові API endpoints
      const [studentsRes, trainingPlansRes, sessionsRes, nextTrainingsRes] = await Promise.all([
        fetch('/api/users/students'),
        fetch('/api/training-plans'),
        fetch('/api/training-sessions'),
        fetch('/api/next-trainings'),
      ]);

      if (!studentsRes.ok) {
        throw new Error(`Помилка завантаження учнів: ${studentsRes.status}`);
      }
      if (!trainingPlansRes.ok) {
        throw new Error(`Помилка завантаження тренувань: ${trainingPlansRes.status}`);
      }

      const [studentsData, trainingPlansData] = await Promise.all([
        studentsRes.json(),
        trainingPlansRes.json(),
      ]);

      let sessionsData: TrainingSession[] = [];
      if (sessionsRes.ok) {
        sessionsData = await sessionsRes.json();
      }

      let nextTrainingsData: NextTraining[] = [];
      if (nextTrainingsRes.ok) {
        nextTrainingsData = await nextTrainingsRes.json();
      }

      console.log("Завантажено:", {
        students: studentsData.length,
        trainingPlans: trainingPlansData.length,
        sessions: sessionsData.length,
        nextTrainings: nextTrainingsData.length,
      });

      setStudents(studentsData);
      setTrainingPlans(trainingPlansData);
      setTrainingSessions(sessionsData);
      setNextTrainings(nextTrainingsData);

      // Розрахунок статистики
      const coachStats: CoachStats = {
        totalStudents: studentsData.length,
        completedTrainings: sessionsData.filter((s: TrainingSession) => s.completed).length,
        upcomingTrainings: trainingPlansData.filter((t: TrainingPlan) => !t.completed).length,
        averagePerformance: sessionsData.length > 0 
          ? sessionsData.reduce((acc: number, session: TrainingSession) => acc + session.performance, 0) / sessionsData.length
          : 0,
      };

      setStats(coachStats);
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
      setError(error instanceof Error ? error.message : "Невідома помилка");
    } finally {
      setLoading(false);
    }
  };

  // Функція для додавання тренування
  const addTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!newTraining.title.trim()) {
        setError("Будь ласка, введіть назву тренування");
        return;
      }
      if (!newTraining.date) {
        setError("Будь ласка, виберіть дату");
        return;
      }
      if (newTraining.assignedTo.length === 0) {
        setError("Будь ласка, виберіть хоча б одного учня");
        return;
      }

      const trainingData = {
        title: newTraining.title.trim(),
        duration: newTraining.duration || "45 хв",
        intensity: newTraining.intensity,
        exercises: newTraining.exercises.filter((ex) => ex.trim() !== ""),
        assignedTo: newTraining.assignedTo,
        date: newTraining.date,
        completed: false,
      };

      const response = await fetch('/api/training-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Помилка сервера: ${response.status}`);
      }

      const createdTraining = await response.json();
      console.log("Тренування створено:", createdTraining);

      setShowAddTraining(false);
      setNewTraining({
        title: "",
        duration: "",
        intensity: "medium",
        exercises: [""],
        assignedTo: [],
        date: "",
      });

      fetchCoachData();
    } catch (error) {
      console.error("Помилка додавання тренування:", error);
      setError(error instanceof Error ? error.message : "Помилка при додаванні тренування");
    }
  };

  // Функція для редагування тренування
  const updateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!editTraining.title.trim()) {
        setError("Будь ласка, введіть назву тренування");
        return;
      }
      if (!editTraining.date) {
        setError("Будь ласка, виберіть дату");
        return;
      }
      if (editTraining.assignedTo.length === 0) {
        setError("Будь ласка, виберіть хоча б одного учня");
        return;
      }

      const trainingData = {
        title: editTraining.title.trim(),
        duration: editTraining.duration || "45 хв",
        intensity: editTraining.intensity,
        exercises: editTraining.exercises.filter((ex) => ex.trim() !== ""),
        assignedTo: editTraining.assignedTo,
        date: editTraining.date,
        completed: editTraining.completed,
      };

      console.log("Оновлюємо тренування:", trainingData);

      const response = await fetch(`/api/training-plans/${editTraining.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Помилка сервера: ${response.status}`);
      }

      const updatedTraining = await response.json();
      console.log("Тренування оновлено:", updatedTraining);

      setShowEditTraining(false);
      setEditTraining({
        id: "",
        title: "",
        duration: "",
        intensity: "medium",
        exercises: [""],
        assignedTo: [],
        date: "",
        completed: false,
      });

      fetchCoachData();
    } catch (error) {
      console.error("Помилка редагування тренування:", error);
      setError(error instanceof Error ? error.message : "Помилка при редагуванні тренування");
    }
  };

  // Функція для відкриття форми редагування
  const openEditTraining = (training: TrainingPlan) => {
    setSelectedTraining(training);
    setEditTraining({
      id: training.id,
      title: training.title,
      duration: training.duration,
      intensity: training.intensity,
      exercises: training.exercises.length > 0 ? training.exercises : [""],
      assignedTo: training.assignedTo,
      date: training.date,
      completed: training.completed,
    });
    setShowEditTraining(true);
  };

  // Функція для видалення тренування
  const deleteTraining = async (trainingId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити це тренування?")) return;

    try {
      setError(null);

      const response = await fetch(`/api/training-plans/${trainingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Помилка видалення: ${response.status}`);
      }

      console.log("Тренування видалено:", trainingId);
      fetchCoachData();
    } catch (error) {
      console.error("Помилка видалення тренування:", error);
      setError(error instanceof Error ? error.message : "Помилка при видаленні тренування");
    }
  };

  // Функція для відмітки тренування як завершеного для всіх учнів
  const markTrainingCompleted = async (trainingId: string) => {
    try {
      setError(null);

      const training = trainingPlans.find((t) => t.id === trainingId);
      if (!training) return;

      // Створюємо сесії тренування для кожного учня
      const sessionPromises = training.assignedTo.map(async (userId) => {
        const sessionData = {
          trainingPlanId: trainingId,
          userId: userId,
          date: new Date().toISOString().split("T")[0],
          duration: training.duration,
          performance: Math.floor(Math.random() * 30) + 70,
          coachNotes: "Тренування успішно завершено",
          completed: true,
        };

        return fetch('/api/training-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionData),
        });
      });

      await Promise.all(sessionPromises);

      // Оновлюємо тренування як завершене
      const trainingResponse = await fetch(`/api/training-plans/${trainingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true,
          completedDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (!trainingResponse.ok) {
        const errorData = await trainingResponse.json();
        throw new Error(errorData.error || `Помилка оновлення тренування: ${trainingResponse.status}`);
      }

      console.log("Тренування відмічено як завершене для всіх учнів");
      fetchCoachData();
    } catch (error) {
      console.error("Помилка відмітки тренування:", error);
      setError(error instanceof Error ? error.message : "Помилка при відмітці тренування");
    }
  };

  // Функція для відмітки тренування як незавершеного
  const markTrainingIncomplete = async (trainingId: string) => {
    try {
      setError(null);

      // Видаляємо сесії тренування, пов'язані з цим планом
      const sessionsToDelete = trainingSessions.filter(
        (session) => session.trainingPlanId === trainingId
      );

      const deletePromises = sessionsToDelete.map((session) =>
        fetch(`/api/training-sessions/${session.id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);

      // Оновлюємо тренування як незавершене
      const trainingResponse = await fetch(`/api/training-plans/${trainingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: false,
          completedDate: null,
        }),
      });

      if (!trainingResponse.ok) {
        const errorData = await trainingResponse.json();
        throw new Error(errorData.error || `Помилка оновлення тренування: ${trainingResponse.status}`);
      }

      console.log("Тренування відмічено як незавершене");
      fetchCoachData();
    } catch (error) {
      console.error("Помилка відмітки тренування:", error);
      setError(error instanceof Error ? error.message : "Помилка при відмітці тренування");
    }
  };

  // Функція для встановлення наступного тренування
  const setNextTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setError(null);

      if (!nextTrainingForm.date || !nextTrainingForm.time || !nextTrainingForm.type) {
        setError("Будь ласка, заповніть обов'язкові поля");
        return;
      }

      const nextTrainingData = {
        userId: selectedStudent.id,
        date: nextTrainingForm.date,
        time: nextTrainingForm.time,
        type: nextTrainingForm.type,
        focus: nextTrainingForm.focus,
        trainingPlanId: nextTrainingForm.trainingPlanId || undefined,
      };

      console.log("Встановлюємо наступне тренування:", nextTrainingData);

      const existingNextTraining = nextTrainings.find(
        (nt) => nt.userId === selectedStudent.id
      );

      let response;
      if (existingNextTraining) {
        response = await fetch(`/api/next-trainings/${existingNextTraining.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nextTrainingData),
        });
      } else {
        response = await fetch('/api/next-trainings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nextTrainingData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Помилка сервера: ${response.status}`);
      }

      console.log("Наступне тренування встановлено");
      setShowSetNextTraining(false);
      setSelectedStudent(null);
      setNextTrainingForm({
        date: "",
        time: "",
        type: "",
        focus: "",
        trainingPlanId: "",
      });

      fetchCoachData();
    } catch (error) {
      console.error("Помилка встановлення тренування:", error);
      setError(error instanceof Error ? error.message : "Помилка при встановленні тренування");
    }
  };

  // Функція для видалення наступного тренування
  const removeNextTraining = async (studentId: string) => {
    try {
      setError(null);

      const nextTraining = nextTrainings.find((nt) => nt.userId === studentId);
      if (!nextTraining) return;

      const response = await fetch(`/api/next-trainings/${nextTraining.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Помилка видалення: ${response.status}`);
      }

      console.log("Наступне тренування видалено");
      fetchCoachData();
    } catch (error) {
      console.error("Помилка видалення тренування:", error);
      setError(error instanceof Error ? error.message : "Помилка при видаленні тренування");
    }
  };

  // Функція для відкриття форми для встановлення наступного тренування
  const openSetNextTraining = (student: User) => {
    setSelectedStudent(student);

    const existingNextTraining = nextTrainings.find(
      (nt) => nt.userId === student.id
    );
    if (existingNextTraining) {
      setNextTrainingForm({
        date: existingNextTraining.date,
        time: existingNextTraining.time,
        type: existingNextTraining.type,
        focus: existingNextTraining.focus,
        trainingPlanId: existingNextTraining.trainingPlanId || "",
      });
    } else {
      setNextTrainingForm({
        date: "",
        time: "",
        type: "",
        focus: "",
        trainingPlanId: "",
      });
    }

    setShowSetNextTraining(true);
  };

  // Функції для роботи з вправами
  const addExerciseField = (isEdit = false) => {
    if (isEdit) {
      setEditTraining({
        ...editTraining,
        exercises: [...editTraining.exercises, ""],
      });
    } else {
      setNewTraining({
        ...newTraining,
        exercises: [...newTraining.exercises, ""],
      });
    }
  };

  const updateExercise = (index: number, value: string, isEdit = false) => {
    if (isEdit) {
      const newExercises = [...editTraining.exercises];
      newExercises[index] = value;
      setEditTraining({
        ...editTraining,
        exercises: newExercises,
      });
    } else {
      const newExercises = [...newTraining.exercises];
      newExercises[index] = value;
      setNewTraining({
        ...newTraining,
        exercises: newExercises,
      });
    }
  };

  const removeExercise = (index: number, isEdit = false) => {
    if (isEdit) {
      const newExercises = editTraining.exercises.filter((_, i) => i !== index);
      setEditTraining({
        ...editTraining,
        exercises: newExercises.length > 0 ? newExercises : [""],
      });
    } else {
      const newExercises = newTraining.exercises.filter((_, i) => i !== index);
      setNewTraining({
        ...newTraining,
        exercises: newExercises.length > 0 ? newExercises : [""],
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження панелі тренера...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "coach") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                👨‍🏫 Панель тренера
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name}
                </p>
                <p className="text-sm text-gray-500">Тренер</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {session.user?.name?.charAt(0) || "Т"}
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
            Вітаю, тренере {session.user?.name}! 🏆
          </h2>
          <p className="text-gray-600">
            Керуйте тренуваннями та відстежуйте прогрес учнів
          </p>
        </div>

        {/* Показуємо помилки */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">👥</div>
                <span className="text-sm font-medium text-green-600">
                  +{stats.totalStudents}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalStudents}
              </h3>
              <p className="text-gray-600 text-sm">Учнів</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">✅</div>
                <span className="text-sm font-medium text-green-600">
                  +{stats.completedTrainings}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.completedTrainings}
              </h3>
              <p className="text-gray-600 text-sm">Завершених тренувань</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📅</div>
                <span className="text-sm font-medium text-blue-600">
                  +{stats.upcomingTrainings}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.upcomingTrainings}
              </h3>
              <p className="text-gray-600 text-sm">Майбутніх тренувань</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📊</div>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.averagePerformance.toFixed(1)}%
              </h3>
              <p className="text-gray-600 text-sm">Середня успішність</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Огляд
            </button>
            <button
              onClick={() => setActiveTab("trainings")}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "trainings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Тренування
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "students"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Учні
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Остання активність
                  </h3>
                  <div className="space-y-4">
                    {trainingSessions.slice(0, 5).map((session) => {
                      const student = students.find(
                        (s) => s.id === session.userId
                      );
                      const training = trainingPlans.find(
                        (t) => t.id == session.trainingPlanId
                      );
                      return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">
                              {student?.name || "Невідомий учень"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {training?.title || "Невідоме тренування"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {session.date}
                            </p>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {session.performance}%
                          </span>
                        </div>
                      );
                    })}
                    {trainingSessions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Ще немає завершених тренувань
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Швидкі дії</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAddTraining(true)}
                      className="w-full text-left p-4 bg-white border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        ➕ Додати тренування
                      </div>
                      <div className="text-sm text-gray-600">
                        Створити нове тренування для учнів
                      </div>
                    </button>
                    <button
                      onClick={() => router.push("/statistics")}
                      className="w-full text-left p-4 bg-white border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        📊 Аналітика
                      </div>
                      <div className="text-sm text-gray-600">
                        Переглянути статистику
                      </div>
                    </button>
                    <button
                      onClick={() => router.push("/chat")}
                      className="w-full text-left flex items-center space-x-3 p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
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
            )}

            {/* Trainings Tab */}
            {activeTab === "trainings" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    Усі тренування ({trainingPlans.length})
                  </h3>
                  <button
                    onClick={() => setShowAddTraining(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    ➕ Додати тренування
                  </button>
                </div>

                <div className="space-y-4">
                  {trainingPlans.map((training) => (
                    <div
                      key={training.id}
                      className="bg-white border rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {training.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>⏱️ {training.duration}</span>
                            <span>⚡ {training.intensity}</span>
                            <span>📅 {training.date}</span>
                            <span
                              className={`px-2 py-1 rounded ${
                                training.completed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {training.completed ? "Завершено" : "Заплановано"}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditTraining(training)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Редагувати
                          </button>
                          {!training.completed ? (
                            <button
                              onClick={() => markTrainingCompleted(training.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Завершити
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                markTrainingIncomplete(training.id)
                              }
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Відновити
                            </button>
                          )}
                          <button
                            onClick={() => deleteTraining(training.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Видалити
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Вправи:</h5>
                        <div className="flex flex-wrap gap-2">
                          {training.exercises.map((exercise, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
                            >
                              {exercise}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Призначено для:</h5>
                        <div className="flex flex-wrap gap-2">
                          {training.assignedTo.map((studentId) => {
                            const student = students.find(
                              (s) => s.id === studentId
                            );
                            return (
                              <span
                                key={studentId}
                                className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded"
                              >
                                <span>
                                  {student?.name || "Невідомий учень"}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {trainingPlans.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Ще немає тренувань</p>
                      <button
                        onClick={() => setShowAddTraining(true)}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Створити перше тренування
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">
                  Мої учні ({students.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => {
                    const studentTrainings = trainingPlans.filter((t) =>
                      t.assignedTo.includes(student.id)
                    );
                    const completedTrainings = studentTrainings.filter(
                      (t) => t.completed
                    ).length;
                    const nextTraining = nextTrainings.find(
                      (nt) => nt.userId === student.id
                    );

                    return (
                      <div
                        key={student.id}
                        className="bg-white border rounded-lg p-6"
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                            {student.name.charAt(0)}
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            {student.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            {student.email}
                          </p>

                          {/* Наступне тренування */}
                          {nextTraining && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm font-medium text-green-800">
                                Наступне тренування
                              </p>
                              <p className="text-xs text-green-600">
                                {nextTraining.date} о {nextTraining.time}
                              </p>
                              <p className="text-xs text-green-600">
                                {nextTraining.type}
                              </p>
                              {nextTraining.focus && (
                                <p className="text-xs text-green-600">
                                  Фокус: {nextTraining.focus}
                                </p>
                              )}
                              <button
                                onClick={() => removeNextTraining(student.id)}
                                className="text-xs text-red-500 hover:text-red-700 mt-1"
                              >
                                Видалити
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {studentTrainings.length}
                              </div>
                              <div className="text-xs text-gray-600">
                                Тренувань
                              </div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {completedTrainings}
                              </div>
                              <div className="text-xs text-gray-600">
                                Завершено
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => openSetNextTraining(student)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm transition-colors"
                            >
                              {nextTraining ? "Змінити" : "Встановити"}{" "}
                              тренування
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/students/${student.id}`)
                              }
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm transition-colors"
                            >
                              Профіль
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {students.length === 0 && (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-gray-500">Ще немає учнів</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal для додавання тренування */}
      {showAddTraining && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Додати нове тренування
                </h3>
                <button
                  onClick={() => setShowAddTraining(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={addTraining}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Назва тренування *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTraining.title}
                      onChange={(e) =>
                        setNewTraining({
                          ...newTraining,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Наприклад: Техніка ведення м'яча"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Тривалість
                      </label>
                      <input
                        type="text"
                        value={newTraining.duration}
                        onChange={(e) =>
                          setNewTraining({
                            ...newTraining,
                            duration: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="45 хв"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Дата *
                      </label>
                      <input
                        type="date"
                        required
                        value={newTraining.date}
                        onChange={(e) =>
                          setNewTraining({
                            ...newTraining,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Складність
                    </label>
                    <select
                      value={newTraining.intensity}
                      onChange={(e) =>
                        setNewTraining({
                          ...newTraining,
                          intensity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Низька</option>
                      <option value="medium">Середня</option>
                      <option value="high">Висока</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Вправи
                      </label>
                      <button
                        type="button"
                        onClick={addExerciseField}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        + Додати вправу
                      </button>
                    </div>
                    <div className="space-y-2">
                      {newTraining.exercises.map((exercise, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={exercise}
                            onChange={(e) =>
                              updateExercise(index, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Вправа ${index + 1}`}
                          />
                          {newTraining.exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExercise(index)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Призначити учням *
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={newTraining.assignedTo.includes(
                              student.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTraining({
                                  ...newTraining,
                                  assignedTo: [
                                    ...newTraining.assignedTo,
                                    student.id,
                                  ],
                                });
                              } else {
                                setNewTraining({
                                  ...newTraining,
                                  assignedTo: newTraining.assignedTo.filter(
                                    (id) => id !== student.id
                                  ),
                                });
                              }
                            }}
                            className="rounded text-blue-500 focus:ring-blue-500"
                          />
                          <span>{student.name}</span>
                          <span className="text-gray-500 text-sm">
                            ({student.email})
                          </span>
                        </label>
                      ))}
                    </div>
                    {newTraining.assignedTo.length === 0 && (
                      <p className="text-red-500 text-sm mt-1">
                        Виберіть хоча б одного учня
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddTraining(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Додати тренування
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal для редагування тренування */}
      {showEditTraining && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Редагувати тренування
                </h3>
                <button
                  onClick={() => setShowEditTraining(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={updateTraining}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Назва тренування *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTraining.title}
                      onChange={(e) =>
                        setEditTraining({
                          ...editTraining,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Тривалість
                      </label>
                      <input
                        type="text"
                        value={editTraining.duration}
                        onChange={(e) =>
                          setEditTraining({
                            ...editTraining,
                            duration: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Дата *
                      </label>
                      <input
                        type="date"
                        required
                        value={editTraining.date}
                        onChange={(e) =>
                          setEditTraining({
                            ...editTraining,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Складність
                    </label>
                    <select
                      value={editTraining.intensity}
                      onChange={(e) =>
                        setEditTraining({
                          ...editTraining,
                          intensity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Низька</option>
                      <option value="medium">Середня</option>
                      <option value="high">Висока</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Вправи
                      </label>
                      <button
                        type="button"
                        onClick={() => addExerciseField(true)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        + Додати вправу
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editTraining.exercises.map((exercise, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={exercise}
                            onChange={(e) =>
                              updateExercise(index, e.target.value, true)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {editTraining.exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExercise(index, true)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Призначити учням *
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={editTraining.assignedTo.includes(
                              student.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditTraining({
                                  ...editTraining,
                                  assignedTo: [
                                    ...editTraining.assignedTo,
                                    student.id,
                                  ],
                                });
                              } else {
                                setEditTraining({
                                  ...editTraining,
                                  assignedTo: editTraining.assignedTo.filter(
                                    (id) => id !== student.id
                                  ),
                                });
                              }
                            }}
                            className="rounded text-blue-500 focus:ring-blue-500"
                          />
                          <span>{student.name}</span>
                          <span className="text-gray-500 text-sm">
                            ({student.email})
                          </span>
                        </label>
                      ))}
                    </div>
                    {editTraining.assignedTo.length === 0 && (
                      <p className="text-red-500 text-sm mt-1">
                        Виберіть хоча б одного учня
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editTraining.completed}
                        onChange={(e) =>
                          setEditTraining({
                            ...editTraining,
                            completed: e.target.checked,
                          })
                        }
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Тренування завершено
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditTraining(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Оновити тренування
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal для встановлення наступного тренування */}
      {showSetNextTraining && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Наступне тренування для {selectedStudent.name}
                </h3>
                <button
                  onClick={() => setShowSetNextTraining(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={setNextTraining}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Дата *
                      </label>
                      <input
                        type="date"
                        required
                        value={nextTrainingForm.date}
                        onChange={(e) =>
                          setNextTrainingForm({
                            ...nextTrainingForm,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Час *
                      </label>
                      <input
                        type="time"
                        required
                        value={nextTrainingForm.time}
                        onChange={(e) =>
                          setNextTrainingForm({
                            ...nextTrainingForm,
                            time: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип тренування *
                    </label>
                    <select
                      required
                      value={nextTrainingForm.type}
                      onChange={(e) =>
                        setNextTrainingForm({
                          ...nextTrainingForm,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Оберіть тип</option>
                      <option value="Індивідуальне">Індивідуальне</option>
                      <option value="Групове">Групове</option>
                      <option value="Технічне">Технічне</option>
                      <option value="Тактичне">Тактичне</option>
                      <option value="Фізична підготовка">
                        Фізична підготовка
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Фокус тренування
                    </label>
                    <input
                      type="text"
                      value={nextTrainingForm.focus}
                      onChange={(e) =>
                        setNextTrainingForm({
                          ...nextTrainingForm,
                          focus: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Наприклад: Ударна техніка, Пасова гра..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Пов'язати з планом тренувань (необов'язково)
                    </label>
                    <select
                      value={nextTrainingForm.trainingPlanId}
                      onChange={(e) =>
                        setNextTrainingForm({
                          ...nextTrainingForm,
                          trainingPlanId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Оберіть план тренувань</option>
                      {trainingPlans
                        .filter((t) =>
                          t.assignedTo.includes(selectedStudent.id)
                        )
                        .map((training) => (
                          <option key={training.id} value={training.id}>
                            {training.title} ({training.date})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowSetNextTraining(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Встановити тренування
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}