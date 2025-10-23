// __tests__/signin-simple.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import SignIn from '@/components/Sign/SignIn';



// Простий мок для useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

// Простий мок для next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: jest.fn(),
  getSession: jest.fn(),
}));

test('SignIn компонент показує форму входу', () => {
  render(<SignIn />);
  
 
});