import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center px-4 py-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Текстова частина */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Ласкаво просимо
              </span>
              <br />
              <span className="text-white">до нашої платформи</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
              Приєднуйтесь до тисячі користувачів, які вже використовують наш сервіс 
              для досягнення своїх цілей. Почніть свою подорож вже сьогодні!
            </p>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
              <Link 
               className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-red-600 hover:to-orange-600"
              href='/signup'>
               
               
              
                Почати зараз
              </Link>
              <Link
               href='/signin'
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300"
              >
                Увійти в акаунт
              </Link>
            </div>

            {/* Переваги */}
            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold">✓</span>
                </div>
                <span className="text-lg">Безкоштовний старт</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold">✓</span>
                </div>
                <span className="text-lg">Зручний інтерфейс</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold">✓</span>
                </div>
                <span className="text-lg">Підтримка 24/7</span>
              </div>
            </div>
          </div>

          {/* Візуальна частина */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
              {/* Анімовані картки */}
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center animate-float">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center animate-float animation-delay-1000">
                <span className="text-3xl">💡</span>
              </div>
              <div className="absolute top-1/2 -left-12 w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center animate-float animation-delay-2000">
                <span className="text-2xl">⭐</span>
              </div>
              
              {/* Центральний контент */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-4xl lg:text-5xl">✨</span>
                  </div>
                  <p className="text-white font-semibold text-lg">Ваш успіх починається тут</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;