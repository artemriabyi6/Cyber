import React from 'react';
import { renderToString } from 'react-dom/server';
import SignUpForm from './SignUp';

// Mock для next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(() => Promise.resolve({ error: null, ok: true })),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock для next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));



// Mock для fetch
global.fetch = jest.fn();

describe('SignUpForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('рендериться без помилок', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toBeTruthy();
  });

  test('містить заголовок форми реєстрації', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toContain('Створіть акаунт');
    expect(htmlString).toContain('Заповніть форму для реєстрації');
  });

  test('містить всі необхідні поля форми', () => {
    const htmlString = renderToString(<SignUpForm />);
    
    expect(htmlString).toContain('Ім&#x27;я');
    expect(htmlString).toContain('Прізвище');
    expect(htmlString).toContain('Email');
    expect(htmlString).toContain('Пароль');
    expect(htmlString).toContain('Підтвердіть пароль');
  });

  test('поля імені та прізвища знаходяться в grid контейнері', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toContain('grid grid-cols-2 gap-4');
  });

  test('містить кнопку реєстрації', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toContain('Зареєструватись');
  });

  test('містить посилання на вхід', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toContain('Вже маєте акаунт?');
    expect(htmlString).toContain('Увійти');
    expect(htmlString).toContain('href="/signin"');
  });

  test('поле пароля має мінімальну довжину', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toContain('minLength="6"');
  });

  test('всі поля форми мають required атрибут', () => {
    const htmlString = renderToString(<SignUpForm />);
    // Перевіряємо що є кілька required атрибутів
    const requiredCount = (htmlString.match(/required/g) || []).length;
    expect(requiredCount).toBeGreaterThan(3);
  });

  test('відповідає snapshot', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toMatchSnapshot();
  });
});

describe('SignUpForm Structure', () => {
  test('має правильну структуру класів Tailwind', () => {
    const htmlString = renderToString(<SignUpForm />);
    
    expect(htmlString).toContain('bg-gradient-to-br');
    expect(htmlString).toContain('from-blue-50');
    expect(htmlString).toContain('to-indigo-100');
    expect(htmlString).toContain('min-h-screen');
    expect(htmlString).toContain('max-w-md');
    expect(htmlString).toContain('bg-white');
    expect(htmlString).toContain('rounded-2xl');
  });

  test('кнопка має правильні стилі та анімації', () => {
    const htmlString = renderToString(<SignUpForm />);
    
    expect(htmlString).toContain('bg-gradient-to-r');
    expect(htmlString).toContain('from-blue-600');
    expect(htmlString).toContain('to-indigo-600');
    expect(htmlString).toContain('transform');
    expect(htmlString).toContain('hover:-translate-y-0.5');
    expect(htmlString).toContain('transition-all');
  });

  test('поля вводу мають правильні стилі фокусу', () => {
    const htmlString = renderToString(<SignUpForm />);
    
    expect(htmlString).toContain('focus:ring-2');
    expect(htmlString).toContain('focus:ring-blue-500');
    expect(htmlString).toContain('focus:border-transparent');
  });
});

describe('SignUpForm Accessibility', () => {
  test('всі поля мають правильні labels', () => {
    const htmlString = renderToString(<SignUpForm />);
    
    expect(htmlString).toContain('for="firstName"');
    expect(htmlString).toContain('for="lastName"');
    expect(htmlString).toContain('for="email"');
    expect(htmlString).toContain('for="password"');
    expect(htmlString).toContain('for="confirmPassword"');
  });

  test('поля мають правильні placeholder', () => {
    const htmlString = renderToString(<SignUpForm />);
    
    expect(htmlString).toContain('placeholder="Введіть ім&#x27;я"');
    expect(htmlString).toContain('placeholder="Введіть прізвище"');
    expect(htmlString).toContain('placeholder="your@email.com"');
    expect(htmlString).toContain('placeholder="Мінімум 6 символів"');
    expect(htmlString).toContain('placeholder="Повторіть пароль"');
  });
});