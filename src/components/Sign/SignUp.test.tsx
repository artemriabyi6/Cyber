import React from 'react';
import { renderToString } from 'react-dom/server';
import SignUpForm from './SignUp';


describe('SignUpForm Component', () => {
  test('рендериться без помилок', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toBeTruthy();
  });

  test('містить всі поля форми', () => {
    const htmlString = renderToString(<SignUpForm />);
    
    // Використовуємо правильні строки з урахуванням HTML кодування
    expect(htmlString).toContain('Ім&#x27;я'); // HTML entity для апострофа
    expect(htmlString).toContain('Прізвище');
    expect(htmlString).toContain('Email');
    expect(htmlString).toContain('Пароль');
    expect(htmlString).toContain('Підтвердіть пароль');
  });

  test('містить кнопку реєстрації', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toContain('Зареєструватись');
  });

  test('містить чекбокс умов', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toContain('Я погоджуюсь з');
    expect(htmlString).toContain('умовами використання');
  });

  test('містить посилання на вхід', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toContain('Вже маєте акаунт?');
    expect(htmlString).toContain('href="/signin"');
  });

  test('відповідає snapshot', () => {
    const htmlString = renderToString(<SignUpForm />);
    expect(htmlString).toMatchSnapshot();
  });
});