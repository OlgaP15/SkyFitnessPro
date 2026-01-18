'use client';

import styles from './signup.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { register, clearError } from '@/store/features/authSlice';
import { toast } from 'react-toastify';

export default function Signup() {
  const dispatch = useAppDispatch();
  const { error, loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [username] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !username.trim() || !password.trim() || !repeat.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    if (password !== repeat) {
      toast.error("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      const result = await dispatch(register({ email, username, password }));
      
      if (register.fulfilled.match(result)) {
        toast.success('Регистрация успешна! Теперь вы можете войти.');
        // Модалка закроется автоматически, пользователь перейдет на вход
      }
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
      <form onSubmit={handleRegister} className={styles.modal__form}>
        <input
          className={classNames(styles.modal__input, styles.login)}
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
          minLength={6}
        />
        <input
          className={classNames(styles.modal__input)}
          type="password"
          placeholder="Повторите пароль"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className={styles.modal__btnSignupEnt}
        >
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
    </>
  );
}