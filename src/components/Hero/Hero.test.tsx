import React from 'react';
import { renderToString } from 'react-dom/server';
import HeroSection from './Hero';



describe('HeroSection Football Coach', () => {
  test('рендериться без помилок', () => {
    const htmlString = renderToString(<HeroSection />);
    expect(htmlString).toBeTruthy();
  });

  test('містить футбольну тематику', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('Стань кращим');
    expect(htmlString).toContain('футболістом');
    expect(htmlString).toContain('ІНДИВІДУАЛЬНІ ТРЕНУВАННЯ');
  });

  test('містить футбольні іконки та елементи', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('⚽');
    expect(htmlString).toContain('🥅');
    expect(htmlString).toContain('👟');
    expect(htmlString).toContain('🏆');
  });

  test('містить кнопки для тренувань', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('Розпочати тренування');
    expect(htmlString).toContain('Увійти в акаунт');
    expect(htmlString).toContain('href="/signup"');
    expect(htmlString).toContain('href="/signin"');
  });

  test('містить статистику тренера', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('50+');
    expect(htmlString).toContain('5 років');
    expect(htmlString).toContain('100%');
    expect(htmlString).toContain('учнів');
    expect(htmlString).toContain('досвіду');
    expect(htmlString).toContain('результат');
  });

  test('має футбольну кольорову схему', () => {
    const htmlString = renderToString(<HeroSection />);
    
    expect(htmlString).toContain('bg-linear-to-br from-green-900');
    expect(htmlString).toContain('text-yellow-400');
    expect(htmlString).toContain('bg-yellow-400');
  });

  test('відповідає snapshot', () => {
    const htmlString = renderToString(<HeroSection />);
    expect(htmlString).toMatchSnapshot();
  });
});