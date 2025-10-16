import React from 'react';
import { renderToString } from 'react-dom/server';
import SignInForm from './SignIn';

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



describe('SignInForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('рендериться без помилок', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toBeTruthy();
  });

  test('містить заголовок форми входу', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toContain('Ласкаво просимо');
    expect(htmlString).toContain('Увійдіть у свій акаунт');
  });

  test('містить поля для email та пароля', () => {
    const htmlString = renderToString(<SignInForm />);
    
    expect(htmlString).toContain('Email');
    expect(htmlString).toContain('Пароль');
    expect(htmlString).toContain('type="email"');
    expect(htmlString).toContain('type="password"');
  });

  test('містить кнопку входу', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toContain('Увійти');
  });

  test('містить посилання на реєстрацію', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toContain('Не маєте акаунта?');
    expect(htmlString).toContain('Зареєструватись');
    expect(htmlString).toContain('href="/signup"');
  });

  test('всі поля форми мають required атрибут', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toContain('required');
  });

  test('відповідає snapshot', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toMatchSnapshot();
  });
});

describe('SignInForm Structure', () => {
  test('має правильну структуру класів Tailwind', () => {
    const htmlString = renderToString(<SignInForm />);
    
    expect(htmlString).toContain('bg-gradient-to-br');
    expect(htmlString).toContain('from-blue-50');
    expect(htmlString).toContain('to-indigo-100');
    expect(htmlString).toContain('min-h-screen');
    expect(htmlString).toContain('bg-white');
    expect(htmlString).toContain('rounded-2xl');
    expect(htmlString).toContain('shadow-xl');
  });

  test('кнопка має правильні стилі', () => {
    const htmlString = renderToString(<SignInForm />);
    
    expect(htmlString).toContain('bg-gradient-to-r');
    expect(htmlString).toContain('from-blue-600');
    expect(htmlString).toContain('to-indigo-600');
    expect(htmlString).toContain('hover:-translate-y-0.5');
  });
});