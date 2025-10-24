// import Link from "next/link";

// const HeroSection = () => {
//   return (
//     <section className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center px-4 py-8">
//       <div className="max-w-7xl mx-auto w-full">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
//           {/* Текстова частина */}
//           <div className="text-center lg:text-left">
//             <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
//               <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
//                 Ласкаво просимо
//               </span>
//               <br />
//               <span className="text-white">до нашої платформи</span>
//             </h1>
            
//             <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
//               Приєднуйтесь до тисячі користувачів, які вже використовують наш сервіс 
//               для досягнення своїх цілей. Почніть свою подорож вже сьогодні!
//             </p>

//             {/* Кнопки */}
//             <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
//               <Link 
//                className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-red-600 hover:to-orange-600"
//               href='/signup'>
               
               
              
//                 Почати зараз
//               </Link>
//               <Link
//                href='/signin'
//                 className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300"
//               >
//                 Увійти в акаунт
//               </Link>
//             </div>

//             {/* Переваги */}
//             <div className="space-y-4 max-w-md mx-auto lg:mx-0">
//               <div className="flex items-center gap-3 text-white/90">
//                 <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="font-bold">✓</span>
//                 </div>
//                 <span className="text-lg">Безкоштовний старт</span>
//               </div>
//               <div className="flex items-center gap-3 text-white/90">
//                 <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="font-bold">✓</span>
//                 </div>
//                 <span className="text-lg">Зручний інтерфейс</span>
//               </div>
//               <div className="flex items-center gap-3 text-white/90">
//                 <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="font-bold">✓</span>
//                 </div>
//                 <span className="text-lg">Підтримка 24/7</span>
//               </div>
//             </div>
//           </div>

//           {/* Візуальна частина */}
//           <div className="relative flex justify-center lg:justify-end">
//             <div className="relative w-80 h-80 lg:w-96 lg:h-96 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
//               {/* Анімовані картки */}
//               <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center animate-float">
//                 <span className="text-2xl">🚀</span>
//               </div>
//               <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center animate-float animation-delay-1000">
//                 <span className="text-3xl">💡</span>
//               </div>
//               <div className="absolute top-1/2 -left-12 w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center animate-float animation-delay-2000">
//                 <span className="text-2xl">⭐</span>
//               </div>
              
//               {/* Центральний контент */}
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="text-center">
//                   <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//                     <span className="text-4xl lg:text-5xl">✨</span>
//                   </div>
//                   <p className="text-white font-semibold text-lg">Ваш успіх починається тут</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;


import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-linear-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Фонові елементи */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-yellow-400/20 rounded-full animate-bounce"></div>
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Текстова частина */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-400/20 rounded-full mb-6 border border-yellow-400/30">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping mr-2"></span>
              <span className="text-yellow-400 text-sm font-semibold">⚽ ІНДИВІДУАЛЬНІ ТРЕНУВАННЯ</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="bg-linear-to-r from-white to-green-200 bg-clip-text text-transparent">
                Стань кращим
              </span>
              <br />
              <span className="text-white">футболістом</span>
              <br />
              <span className="text-yellow-400">вже сьогодні!</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-green-100 mb-8 leading-relaxed max-w-2xl">
              Індивідуальні тренування з професійним тренером для підвищення 
              техніки, швидкості та майстерності гри. Розкрий свій потенціал!
            </p>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
              <Link 
                href='/signup'
                className="px-8 py-4 bg-linear-to-r from-yellow-400 to-yellow-500 text-green-900 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-yellow-300 hover:to-yellow-400 flex items-center justify-center"
              >
                <span className="mr-2">⚽</span>
                Розпочати тренування
              </Link>
              <Link
                href='/signin'
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
              >
                <span className="mr-2">👤</span>
                Увійти в акаунт
              </Link>
            </div>

            {/* Переваги */}
            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3 text-green-100">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center shrink-0 border border-yellow-400/30">
                  <span className="font-bold text-yellow-400">⚽</span>
                </div>
                <span className="text-lg">Індивідуальний підхід</span>
              </div>
              <div className="flex items-center gap-3 text-green-100">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center shrink-0 border border-yellow-400/30">
                  <span className="font-bold text-yellow-400">🎯</span>
                </div>
                <span className="text-lg">Техніка та тактика</span>
              </div>
              <div className="flex items-center gap-3 text-green-100">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center shrink-0 border border-yellow-400/30">
                  <span className="font-bold text-yellow-400">📊</span>
                </div>
                <span className="text-lg">Аналіз прогресу</span>
              </div>
            </div>

            {/* Статистика */}
            <div className="flex flex-wrap gap-6 mt-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">50+</div>
                <div className="text-green-200 text-sm">учнів</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">5 років</div>
                <div className="text-green-200 text-sm">досвіду</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">100%</div>
                <div className="text-green-200 text-sm">результат</div>
              </div>
            </div>
          </div>

          {/* Візуальна частина */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Футбольне поле як фон */}
              <div className="absolute inset-0 bg-green-700/30">
                <div className="absolute inset-0 bg-linear-to-br from-green-600/20 to-emerald-800/20"></div>
                {/* Лінії поля */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Анімовані елементи */}
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-yellow-400/20 backdrop-blur-sm rounded-2xl border border-yellow-400/30 flex items-center justify-center animate-float">
                <span className="text-2xl">🥅</span>
              </div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center animate-float animation-delay-1000">
                <span className="text-3xl">👟</span>
              </div>
              <div className="absolute top-1/2 -left-12 w-16 h-16 bg-yellow-400/20 backdrop-blur-sm rounded-2xl border border-yellow-400/30 flex items-center justify-center animate-float animation-delay-2000">
                <span className="text-2xl">⚽</span>
              </div>
              
              {/* Центральний контент */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-linear-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-white/20">
                    <span className="text-4xl lg:text-5xl">🏆</span>
                  </div>
                  <p className="text-white font-semibold text-lg bg-black/30 backdrop-blur-sm rounded-lg py-2 px-4">
                    Твій шлях до успіху
                  </p>
                </div>
              </div>

              {/* Рухомий м'яч */}
              <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg animate-bounce flex items-center justify-center">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Хвиля внизу */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-12 text-green-950"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            fill="currentColor"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            fill="currentColor"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;