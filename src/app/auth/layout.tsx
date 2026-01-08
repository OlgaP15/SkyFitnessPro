'use client';

import { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { restoreSession } from '../../store/features/authSlice';
import { useRouter } from 'next/navigation';
import styles from './layout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuth } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) {
      router.push('/');
    }
  }, [isAuth, router]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.containerEnter}>
        <div className={styles.modal__block}>
          <div className={styles.modal__form}>{children}</div>
        </div>
      </div>
    </div>
  );
}
