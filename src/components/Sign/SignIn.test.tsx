import React from 'react';
import { renderToString } from 'react-dom/server';
import SignInForm from './SignIn';



describe('SignInForm Component', () => {
  test('рендериться без помилок', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toBeTruthy();
  });

  test('містить поля для входу', () => {
    const htmlString = renderToString(<SignInForm />);
    
    // Перевіряємо наявність ключових елементів (з урахуванням HTML кодування)
    expect(htmlString).toContain('Email');
    expect(htmlString).toContain('Пароль');
    expect(htmlString).toContain('Запам&#x27;ятати мене');
    expect(htmlString).toContain('Забули пароль?');
  });

  test('містить кнопку входу', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toContain('Увійти');
  });

  test('містить посилання на реєстрацію', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toContain('Не маєте акаунта?');
    expect(htmlString).toContain('href="/signup"');
  });

  test('відповідає snapshot', () => {
    const htmlString = renderToString(<SignInForm />);
    expect(htmlString).toMatchSnapshot();
  });
});