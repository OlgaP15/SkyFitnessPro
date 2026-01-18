'use client';

import Link from 'next/link';
import styles from './AuthButtons.module.css';
import { useAppSelector } from '../../../store/store';
import { useModal } from '@/context/modalContex';

export default function AuthButtons() {
  const { isAuth, user } = useAppSelector((state) => state.auth);
  const { openLogin } = useModal();

  if (isAuth) {
    return (
      <div className={styles.userInfo}>
        <Link href="/profile" className={styles.profileButton}>
          {user?.username || 'Профиль'}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.authButtons}>
      <button 
        onClick={() => openLogin(true)} // Передаем true для формы входа
        className={styles.loginButton}
      >
        Вход
      </button>
    </div>
  );
}