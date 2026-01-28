import { Roboto } from 'next/font/google';
import type { Metadata } from 'next';
import ReduxProvider from '../store/ReduxProvider';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './components/Navigation/Navigation';
import { ModalProvider } from '@/context/modalContext';
import LoginModal from './components/LoginModal/LoginModal';
import { ToastContainer } from 'react-toastify';

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
      <body className={roboto.className} suppressHydrationWarning>
        <ModalProvider>
          <ReduxProvider>
            <Navigation />
            <main>{children}</main>
            <LoginModal />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </ReduxProvider>
        </ModalProvider>
      </body>
    </html>
  );
}