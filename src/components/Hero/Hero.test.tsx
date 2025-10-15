import React from 'react';
import { renderToString } from 'react-dom/server';
import HeroSection from './Hero';



describe('HeroSection Component', () => {
  test('рендериться без помилок', () => {
    const component = <HeroSection />;
    const htmlString = renderToString(component);
    
    expect(htmlString).toBeTruthy();
    expect(typeof htmlString).toBe('string');
    expect(htmlString.length).toBeGreaterThan(0);
  });

  test('містить основний заголовок', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('Ласкаво просимо');
    expect(htmlString).toContain('до нашої платформи');
  });

  test('містить опис', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('Приєднуйтесь до тисячі користувачів');
    expect(htmlString).toContain('Почніть свою подорож вже сьогодні');
  });

  test('містить посилання з правильними href', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('href="/signup"');
    expect(htmlString).toContain('href="/signin"');
    expect(htmlString).toContain('Почати зараз');
    expect(htmlString).toContain('Увійти в акаунт');
  });

  test('містить всі переваги з іконками', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('Безкоштовний старт');
    expect(htmlString).toContain('Зручний інтерфейс');
    expect(htmlString).toContain('Підтримка 24/7');
    expect(htmlString.match(/✓/g)).toHaveLength(3); // 3 іконки галочки
  });

  test('містить всі емоції в візуальній частині', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('🚀');
    expect(htmlString).toContain('💡');
    expect(htmlString).toContain('⭐');
    expect(htmlString).toContain('✨');
  });

  test('має правильну структуру Tailwind CSS класів', () => {
    const htmlString = renderToString(<HeroSection />);
    
    // Основні класи контейнера
    expect(htmlString).toContain('min-h-screen');
    expect(htmlString).toContain('bg-gradient-to-br');
    expect(htmlString).toContain('from-blue-600');
    expect(htmlString).toContain('via-purple-600');
    expect(htmlString).toContain('to-indigo-800');
    
    // Grid система
    expect(htmlString).toContain('grid grid-cols-1');
    expect(htmlString).toContain('lg:grid-cols-2');
    
    // Текстовий градієнт
    expect(htmlString).toContain('bg-gradient-to-r');
    expect(htmlString).toContain('bg-clip-text');
    expect(htmlString).toContain('text-transparent');
  });

  test('містить всі анімаційні класи', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('animate-float');
    expect(htmlString).toContain('animation-delay-1000');
    expect(htmlString).toContain('animation-delay-2000');
  });

  test('має правильні класи для кнопок', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('bg-gradient-to-r from-red-500 to-orange-500');
    expect(htmlString).toContain('bg-white/10 backdrop-blur-sm');
    expect(htmlString).toContain('hover:-translate-y-1');
    expect(htmlString).toContain('transition-all duration-300');
  });

  test('візуальна частина має правильні розміри', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('w-80 h-80');
    expect(htmlString).toContain('lg:w-96 lg:h-96');
    expect(htmlString).toContain('rounded-2xl');
  });

  test('центральний елемент має правильні стилі', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('bg-gradient-to-br from-yellow-400 to-orange-500');
    expect(htmlString).toContain('rounded-3xl');
    expect(htmlString).toContain('Ваш успіх починається тут');
  });
});

describe('HeroSection Structure', () => {
  test('має правильну HTML структуру', () => {
    const htmlString = renderToString(<HeroSection />);
    
    // Перевіряємо основні HTML теги
    expect(htmlString).toContain('<section');
    expect(htmlString).toContain('</section>');
    expect(htmlString).toContain('<h1');
    expect(htmlString).toContain('</h1>');
    expect(htmlString).toContain('<p');
    expect(htmlString).toContain('</p>');
    expect(htmlString).toContain('<div');
  });

  test('посилання мають правильні класи', () => {
    const htmlString = renderToString(<HeroSection />);
    
    // Перевіряємо що посилання мають Tailwind класи
    expect(htmlString).toContain('px-8 py-4');
    expect(htmlString).toContain('rounded-xl');
    expect(htmlString).toContain('font-semibold');
  });
});

describe('HeroSection Snapshot', () => {
  test('відповідає snapshot', () => {
    const htmlString = renderToString(<HeroSection />);
    
    // Створюємо snapshot для подальшого порівняння
    expect(htmlString).toMatchSnapshot();
  });

  test('snapshot містить ключові елементи', () => {
    const htmlString = renderToString(<HeroSection />);
    const snapshot = htmlString;
    
    expect(snapshot).toContain('Ласкаво просимо');
    expect(snapshot).toContain('/signup');
    expect(snapshot).toContain('/signin');
    expect(snapshot).toContain('🚀');
  });
});

describe('HeroSection Accessibility', () => {
  test('містить семантичні HTML теги', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('<section'); // Семантичний тег секції
    expect(htmlString).toContain('<h1'); // Заголовок першого рівня
  });

  test('посилання мають зрозумілий текст', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('Почати зараз');
    expect(htmlString).toContain('Увійти в акаунт');
  });
});