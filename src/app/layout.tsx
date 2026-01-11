import { Roboto } from 'next/font/google';
import type { Metadata } from 'next';
import ReduxProvider from '../store/ReduxProvider'; // Исправленный путь
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './components/Navigation/Navigation';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'SkyFitnessPro - Онлайн тренировки',
  description: 'Онлайн-тренировки для занятий дома',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={roboto.className}>
        <ReduxProvider>
          <Navigation />
          <main>{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}
