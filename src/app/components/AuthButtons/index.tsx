'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './AuthButtons.module.css';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { useModal } from '@/context/modalContext';
import { getMe } from '@/app/services/auth/authApi';
import { setUser, logout } from '@/store/features/authSlice';
import {
  getPendingCourses,
  prunePendingCourses,
} from '@/app/services/pendingCourses';

export default function AuthButtons() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuth, user } = useAppSelector((state) => state.auth);
  const { openLogin } = useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const userEmail = useMemo(() => user?.user.email || null, [user?.user.email]);

  useEffect(() => {
    if (!isAuth || userEmail) return;

    getMe()
      .then((userData) => {
        if (userData?.user.email) {
          const serverCourses = userData.selectedCourses || [];
          const pendingCourses = getPendingCourses();
          prunePendingCourses(serverCourses);
          userData.selectedCourses = Array.from(
            new Set([...serverCourses, ...pendingCourses]),
          );
          dispatch(setUser(userData));
        }
      })
      .catch((e: Error & { status?: number }) => {
        if (e?.status === 401 || e?.status === 400) dispatch(logout());
      });
  }, [isAuth, userEmail, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        buttonRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const getUserName = (): string => {
    if (!isAuth || !user) {
      return 'Профиль';
    }

    const email = user.user.email;
    if (email && typeof email === 'string' && email.trim() !== '') {
      const namePart = email.split('@')[0];
      if (namePart && namePart.trim() !== '') {
        return namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }
    }

    return 'Профиль';
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsModalOpen(false);
    router.push('/');
  };

  const handleProfileClick = () => {
    setIsModalOpen(false);
    router.push('/profile');
  };

  if (isAuth) {
    const displayName = getUserName();
    return (
      <div className={styles.userInfo}>
        <button
          ref={buttonRef}
          onClick={() => setIsModalOpen(!isModalOpen)}
          className={styles.profileButton}
        >
          <Image
            src="/images/Profile.svg"
            alt="Profile"
            width={50}
            height={50}
            className={styles.profileIcon}
          />
          <span className={styles.modalName}>{displayName}</span>
          <Image
            src="/images/galka.svg"
            alt="Dropdown"
            width={13}
            height={8}
            className={styles.dropdownIcon}
          />
        </button>
        {isModalOpen && (
          <div ref={modalRef} className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.userName}>{displayName}</div>
              <div className={styles.userEmail}>{user?.user.email || ''}</div>
              <button
                onClick={handleProfileClick}
                className={styles.profileModalButton}
              >
                Мой профиль
              </button>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.authButtons}>
      <button onClick={() => openLogin(true)} className={styles.loginButton}>
        Вход
      </button>
    </div>
  );
}
