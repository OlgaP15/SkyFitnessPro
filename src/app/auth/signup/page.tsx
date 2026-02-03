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

    if (!email.trim() || !password.trim() || !repeat.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Введите корректный email адрес');
      return;
    }

    if (password !== repeat) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      toast.error('Пароль должен содержать не менее 6 символов');
      return;
    }

    const specialCharCount = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (specialCharCount < 2) {
      toast.error('Пароль должен содержать не менее 2 спецсимволов');
      return;
    }

    const hasUpperCase = /[A-ZА-Я]/.test(password);
    if (!hasUpperCase) {
      toast.error('Пароль должен содержать как минимум одну заглавную букву');
      return;
    }

    try {
      const result = await dispatch(register({ email, password }));
      
      if (register.fulfilled.match(result)) {
        toast.success('Регистрация успешна! Теперь вы можете войти.');
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
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>
      </Link>
      <form onSubmit={handleRegister} className={styles.modal__form}>
        <input
          className={classNames(styles.modal__input, styles.login)}
          type="email"
          placeholder="Эл. почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={loading}
        />
        <input
          className={classNames(styles.modal__input)}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
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
          autoComplete="new-password"
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