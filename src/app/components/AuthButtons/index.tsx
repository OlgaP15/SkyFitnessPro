'use client';

import Link from 'next/link';
import styles from './AuthButtons.module.css';
import { useAppSelector } from '../../../store/store';

export default function AuthButtons() {
  const { isAuth, user } = useAppSelector((state) => state.auth);

  if (isAuth) {
    return (
      <div className={styles.userInfo}>
        <span className={styles.userName}></span>
        <Link href="/profile" className={styles.profileButton}>
        {user?.username}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.authButtons}>
      <Link href="/auth/signin" className={styles.loginButton}>
        Вход
      </Link>
    </div>
  );
}
