'use client';

import styles from './signin.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { login, clearError } from '@/store/features/authSlice';
import { toast } from 'react-toastify';

export default function Signin() {
  const dispatch = useAppDispatch();
  const { error, loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      await dispatch(login({ email, password }));
      // Модалка закроется автоматически через useEffect в LoginModal
    } catch {}
  };

  return (
    <>
      <Link href="/">
        <div className={styles.modal__logo}>
          <Image
            src="/img/logo.svg"
            alt="SkyFitnessPro"
            width={220}
            height={35}
            priority
          />
        </div>
      </Link>
      <form onSubmit={handleLogin} className={styles.modal__form}>
        <input
          className={classNames(styles.modal__input)}
          type="text"
          placeholder="Эл. почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          className={classNames(styles.modal__input)}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={styles.modal__btnEnter}
        >
          {loading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
    </>
  );
}