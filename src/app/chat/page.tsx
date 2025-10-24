// "use client";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState, useRef } from "react";

// interface Message {
//   id: string;
//   text: string;
//   senderId: string;
//   receiverId: string;
//   timestamp: string;
//   read: boolean;
// }

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: "student" | "coach";
// }

// export default function ChatPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [allUsers, setAllUsers] = useState<User[]>([]);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [isLoadingMessages, setIsLoadingMessages] = useState(false);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch("http://localhost:3001/users");
//       if (response.ok) {
//         const users: User[] = await response.json();
        
//         // Фільтруємо поточного користувача зі списку
//         const filteredUsers = users.filter(user => user.id !== session?.user?.id);
//         setAllUsers(filteredUsers);
        
//         if (filteredUsers.length > 0) {
//           setSelectedUser(filteredUsers[0]);
//         }
//       }
//     } catch (err) {
//       console.error("Помилка завантаження користувачів:", err);
//     }
//   };

//   const fetchMessages = async (otherUserId: string) => {
//     if (!session?.user?.id) return;
    
//     try {
//       setIsLoadingMessages(true);
//       const response = await fetch(
//         `http://localhost:3001/messages?senderId=${session.user.id}&receiverId=${otherUserId}`
//       );
      
//       if (response.ok) {
//         const sentMessages: Message[] = await response.json();
        
//         const receivedResponse = await fetch(
//           `http://localhost:3001/messages?senderId=${otherUserId}&receiverId=${session.user.id}`
//         );
        
//         if (receivedResponse.ok) {
//           const receivedMessages: Message[] = await receivedResponse.json();
//           const allMessages = [...sentMessages, ...receivedMessages];
//           allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
//           setMessages(allMessages);
//         }
//       }
//     } catch (err) {
//       console.error("Помилка завантаження повідомлень:", err);
//     } finally {
//       setIsLoadingMessages(false);
//     }
//   };

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/signin");
//     } else if (status === "authenticated") {
//       fetchUsers();
//       setLoading(false);
//     }
//   }, [status, session, router]);

//   useEffect(() => {
//     if (selectedUser && session?.user?.id) {
//       fetchMessages(selectedUser.id);
//       // Імітація реального чату - оновлення кожні 5 секунд
//       const interval = setInterval(() => {
//         fetchMessages(selectedUser.id);
//       }, 5000);
      
//       return () => clearInterval(interval);
//     }
//   }, [selectedUser, session?.user?.id]);

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !selectedUser || !session?.user?.id) return;

//     try {
//       const message: Message = {
//         id: Date.now().toString(),
//         text: newMessage.trim(),
//         senderId: session.user.id,
//         receiverId: selectedUser.id,
//         timestamp: new Date().toISOString(),
//         read: false
//       };

//       const response = await fetch("http://localhost:3001/messages", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(message),
//       });

//       if (response.ok) {
//         setMessages(prev => [...prev, message]);
//         setNewMessage("");
//       }
//     } catch (err) {
//       console.error("Помилка відправки повідомлення:", err);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const formatTime = (timestamp: string) => {
//     return new Date(timestamp).toLocaleTimeString('uk-UA', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatDate = (timestamp: string) => {
//     const date = new Date(timestamp);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     if (date.toDateString() === today.toDateString()) {
//       return "Сьогодні";
//     } else if (date.toDateString() === yesterday.toDateString()) {
//       return "Вчора";
//     } else {
//       return date.toLocaleDateString('uk-UA');
//     }
//   };

//   const getUnreadCount = (userId: string) => {
//     return messages.filter(msg => 
//       msg.senderId === userId && 
//       msg.receiverId === session?.user?.id && 
//       !msg.read
//     ).length;
//   };

//   const getUserRoleText = (user: User) => {
//     if (!user.role) return "Користувач";
//     return user.role === "coach" ? "Тренер" : "Учень";
//   };

//   if (status === "loading" || loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Завантаження чату...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!session) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <button
//                 onClick={() => router.push("/dashboard")}
//                 className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <span className="text-lg">←</span>
//               </button>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 💬 Чат {session.user?.role === "coach" ? "з користувачами" : "з тренером"}
//               </h1>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="text-right">
//                 <p className="text-sm font-medium text-gray-900">
//                   {session.user?.name}
//                 </p>
//                 <p className="text-sm text-gray-500 capitalize">
//                   {session.user?.role === "coach" ? "Тренер" : "Учень"}
//                 </p>
//               </div>
//               <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {session.user?.name?.charAt(0) || "У"}
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//           <div className="flex h-[600px]">
//             {/* Users List */}
//             <div className="w-1/3 border-r bg-gray-50">
//               <div className="p-4 border-b">
//                 <h2 className="font-semibold text-gray-900">
//                   {session.user?.role === "coach" ? "Всі користувачі" : "Тренери"}
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {allUsers.length} {allUsers.length === 1 ? 'користувач' : 'користувачів'}
//                 </p>
//               </div>
              
//               <div className="overflow-y-auto h-full">
//                 {allUsers.length === 0 ? (
//                   <div className="p-4 text-center text-gray-500">
//                     Немає користувачів для спілкування
//                   </div>
//                 ) : (
//                   allUsers.map((user) => (
//                     <div
//                       key={user.id}
//                       onClick={() => setSelectedUser(user)}
//                       className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
//                         selectedUser?.id === user.id ? "bg-white border-l-4 border-l-green-500" : ""
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                           <div 
//                             className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
//                               user.role === "coach" 
//                                 ? "bg-gradient-to-r from-orange-500 to-orange-600"
//                                 : "bg-gradient-to-r from-blue-500 to-blue-600"
//                             }`}
//                           >
//                             {user.name.charAt(0)}
//                           </div>
//                           <div>
//                             <h3 className="font-medium text-gray-900">
//                               {user.name}
//                             </h3>
//                             <p className="text-sm text-gray-500">
//                               {getUserRoleText(user)}
//                             </p>
//                           </div>
//                         </div>
//                         {getUnreadCount(user.id) > 0 && (
//                           <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                             {getUnreadCount(user.id)}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             {/* Chat Area */}
//             <div className="flex-1 flex flex-col">
//               {selectedUser ? (
//                 <>
//                   {/* Chat Header */}
//                   <div className="p-4 border-b bg-white">
//                     <div className="flex items-center space-x-3">
//                       <div 
//                         className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
//                           selectedUser.role === "coach" 
//                             ? "bg-gradient-to-r from-orange-500 to-orange-600"
//                             : "bg-gradient-to-r from-blue-500 to-blue-600"
//                         }`}
//                       >
//                         {selectedUser.name.charAt(0)}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">
//                           {selectedUser.name}
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           {getUserRoleText(selectedUser)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Messages */}
//                   <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//                     {isLoadingMessages ? (
//                       <div className="text-center py-8">
//                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
//                         <p className="mt-2 text-gray-600 text-sm">Завантаження повідомлень...</p>
//                       </div>
//                     ) : messages.length === 0 ? (
//                       <div className="text-center py-8">
//                         <div className="text-4xl mb-2">💬</div>
//                         <p className="text-gray-600">
//                           Почніть розмову з {getUserRoleText(selectedUser).toLowerCase()}
//                         </p>
//                         <p className="text-sm text-gray-500 mt-1">
//                           Напишіть перше повідомлення
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         {messages.map((message, index) => {
//                           const isOwnMessage = message.senderId === session.user?.id;
//                           const showDate = index === 0 || 
//                             formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
                          
//                           return (
//                             <div key={message.id}>
//                               {showDate && (
//                                 <div className="text-center my-4">
//                                   <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
//                                     {formatDate(message.timestamp)}
//                                   </span>
//                                 </div>
//                               )}
                              
//                               <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
//                                 <div
//                                   className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
//                                     isOwnMessage
//                                       ? 'bg-green-500 text-white rounded-br-none'
//                                       : 'bg-white text-gray-900 border rounded-bl-none'
//                                   }`}
//                                 >
//                                   <p className="text-sm">{message.text}</p>
//                                   <p
//                                     className={`text-xs mt-1 ${
//                                       isOwnMessage ? 'text-green-100' : 'text-gray-500'
//                                     }`}
//                                   >
//                                     {formatTime(message.timestamp)}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>
//                           );
//                         })}
//                         <div ref={messagesEndRef} />
//                       </div>
//                     )}
//                   </div>

//                   {/* Message Input */}
//                   <div className="p-4 border-t bg-white">
//                     <div className="flex space-x-4">
//                       <textarea
//                         value={newMessage}
//                         onChange={(e) => setNewMessage(e.target.value)}
//                         onKeyPress={handleKeyPress}
//                         placeholder="Введіть повідомлення..."
//                         className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
//                         rows={1}
//                         style={{ minHeight: '50px', maxHeight: '120px' }}
//                       />
//                       <button
//                         onClick={sendMessage}
//                         disabled={!newMessage.trim()}
//                         className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
//                       >
//                         Надіслати
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="flex-1 flex items-center justify-center">
//                   <div className="text-center">
//                     <div className="text-6xl mb-4">💬</div>
//                     <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                       Виберіть користувача
//                     </h3>
//                     <p className="text-gray-600">
//                       Для початку спілкування оберіть користувача зі списку
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


// app/chat/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  read: boolean;
  sender: User;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
        
        // Автоматично вибираємо першого тренера, якщо є
        const coach = usersData.find((user: User) => user.role === 'coach');
        if (coach) {
          setSelectedUser(coach);
        }
      }
    } catch (error) {
      console.error('Помилка завантаження користувачів:', error);
    }
  };

  const fetchMessages = async (receiverId: string) => {
    try {
      const response = await fetch(`/api/messages?receiverId=${receiverId}`);
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Помилка завантаження повідомлень:', error);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchUsers();
      setLoading(false);
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      
      // Оновлюємо повідомлення кожні 5 секунд
      const interval = setInterval(() => {
        fetchMessages(selectedUser.id);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage,
          receiverId: selectedUser.id
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error('Помилка відправки повідомлення:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження чату...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
              <h1 className="text-2xl font-bold text-gray-900">💬 Чат</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {session.user?.role === 'coach' ? 'Тренер' : 'Учень'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border h-[600px] flex">
          {/* Список користувачів */}
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Користувачі</h2>
            </div>
            <div className="overflow-y-auto h-[544px]">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-green-50 border-green-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {user.role === 'coach' ? 'Тренер' : 'Учень'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Область повідомлень */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedUser.role === 'coach' ? 'Тренер' : 'Учень'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === session.user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === session.user.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === session.user.id
                              ? 'text-green-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString('uk-UA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Введіть повідомлення..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {sending ? '...' : 'Надіслати'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Оберіть користувача для початку розмови
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}