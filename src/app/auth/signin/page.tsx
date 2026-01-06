'use client';

import styles from './signin.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { login, clearError } from '@/store/features/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Signin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error, loading, isAuth } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) {
      router.push('/');
    }
  }, [isAuth, router]);

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
      const result = await dispatch(login({ email, password }));

      if (login.fulfilled.match(result)) {
        toast.success('Вход выполнен успешно!');
        router.push('/');
      }
    } catch {}
  };

  return (
    <>
      <Link href="/">
        <div className={styles.modal__logo}>
          <Image
            src="/img/logo_modal.png"
            alt="logo"
            width={140}
            height={21}
            priority
          />
        </div>
      </Link>
      <form onSubmit={handleLogin} className={styles.modal__form}>
        <input
          className={classNames(styles.modal__input, styles.login)}
          type="email"
          placeholder="Почта"
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
      <Link
        href="/auth/signup"
        className={styles.modal__btnSignup}
        onClick={(e) => loading && e.preventDefault()}
      >
        Зарегистрироваться
      </Link>
    </>
  );
}
