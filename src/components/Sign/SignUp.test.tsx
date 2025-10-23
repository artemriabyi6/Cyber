// __tests__/signup-simple.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import SignUp from '@/components/Sign/SignUp';


// Простий мок для useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Простий мок для fetch
global.fetch = jest.fn();

test('SignUp компонент показує форму реєстрації', () => {
  render(<SignUp />);
  
 
});