'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '@/store/store';
import { restoreSession } from '@/store/features/authSlice';
import Logo from '../Logo';
import AuthButtons from '../AuthButtons';
import styles from './Navigation.module.css';

export default function Navigation() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  const isProfilePage = pathname === '/profile';

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <div className={styles.headerContent}>
          <Logo />
          <AuthButtons />
        </div>
        {!isProfilePage && (
          <span className={styles.subtitle}>
            Онлайн-тренировки для занятий дома
          </span>
        )}
      </div>
    </nav>
  );
}