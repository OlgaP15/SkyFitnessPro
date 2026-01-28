'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/store';
import { logout, setUser, restoreSession } from '@/store/features/authSlice';
import { fetchCourses } from '@/store/features/courseSlice';
import { getMe } from '@/app/services/auth/authApi';
import CourseCard from '../components/CourseCard';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { user, isAuth } = useAppSelector((state) => state.auth);
  const { courses } = useAppSelector((state) => state.course);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    dispatch(restoreSession());
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    if (isChecking) return;

    const token = localStorage.getItem('token');
    if (!token || !isAuth) {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        await dispatch(fetchCourses());

        const currentState = store.getState();
        const currentUser = currentState.auth.user;

        const userData = await getMe();

        if (currentUser && currentUser.selectedCourses) {
          const localCourses = currentUser.selectedCourses;
          const serverCourses = userData.selectedCourses || [];
          const allCoursesSet = new Set([...localCourses, ...serverCourses]);
          userData.selectedCourses = Array.from(allCoursesSet);
        }

        dispatch(setUser(userData));

        if (
          !userData.selectedCourses ||
          userData.selectedCourses.length === 0
        ) {
          const localCourses = currentUser?.selectedCourses || [];
          if (localCourses.length > 0) {
            userData.selectedCourses = localCourses;
            dispatch(setUser(userData));
          }
        }
      } catch {
        const currentState = store.getState();
        const currentUser = currentState.auth.user;
        if (
          currentUser &&
          currentUser.selectedCourses &&
          currentUser.selectedCourses.length > 0
        ) {
        }
      }
    };

    loadData();
  }, [isAuth, isChecking, router, dispatch, store]);

  useEffect(() => {
    if (!isAuth || isChecking) return;

    const updateUserData = async () => {
      try {
        const currentState = store.getState();
        const currentUser = currentState.auth.user;
        const userData = await getMe();

        if (currentUser && currentUser.selectedCourses) {
          const localCourses = currentUser.selectedCourses;
          const serverCourses = userData.selectedCourses || [];

          const allCoursesSet = new Set([...localCourses, ...serverCourses]);
          userData.selectedCourses = Array.from(allCoursesSet);
        }

        dispatch(setUser(userData));
      } catch {}
    };

    const handleFocus = () => {
      updateUserData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateUserData();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          const currentState = store.getState();
          const currentUser = currentState.auth.user;

          if (currentUser && currentUser.selectedCourses) {
            const localCourses = currentUser.selectedCourses;
            const storageCourses = userData.selectedCourses || [];
            const allCoursesSet = new Set([...localCourses, ...storageCourses]);
            userData.selectedCourses = Array.from(allCoursesSet);
          }

          dispatch(setUser(userData));
        } catch {}
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuth, isChecking, dispatch, store]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  useEffect(() => {
    if (!isAuth || isChecking) return;

    const updateUser = async () => {
      try {
        const currentState = store.getState();
        const currentUser = currentState.auth.user;
        const userData = await getMe();

        if (currentUser && currentUser.selectedCourses) {
          const localCourses = currentUser.selectedCourses;
          const serverCourses = userData.selectedCourses || [];

          const allCoursesSet = new Set([...localCourses, ...serverCourses]);
          userData.selectedCourses = Array.from(allCoursesSet);
        }

        dispatch(setUser(userData));
      } catch {}
    };

    updateUser();
  }, [courses.length, isAuth, isChecking, dispatch, store]);

  const userCourses = useMemo(() => {
    if (!user || !courses || courses.length === 0) {
      return [];
    }

    const selectedCoursesIds = user.selectedCourses || [];
    if (selectedCoursesIds.length === 0) {
      return [];
    }

    const filtered = courses.filter((course) =>
      selectedCoursesIds.includes(course._id),
    );

    return filtered;
  }, [user, courses]);

  if (isChecking) {
    return (
      <div className={styles.profilePage}>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (!isAuth || !user) {
    return null;
  }

  const getUserName = (): string => {
    if (!user.email) return '';
    const name = user.email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className={styles.profilePage}>
      <h1 className={styles.profileTitle}>Профиль</h1>

      <div className={styles.profileMain}>
        <div className={styles.profileAvatar}>
          <Image
            src="/images/profil.svg"
            alt="Аватар"
            width={197}
            height={197}
            className={styles.avatarImage}
            loading="eager"
            priority
          />
        </div>

        <div className={styles.profileDivider}></div>

        <div className={styles.profileInfo}>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{getUserName()}</p>
            <p className={styles.userLogin}>Логин: {user.email}</p>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
            </button>
          </div>
          <div className={styles.coursesCount}>{userCourses.length}</div>
        </div>
      </div>

      <div className={styles.coursesSection}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 className={styles.sectionTitle}>Мои курсы</h2>
        </div>
        {userCourses.length > 0 ? (
          <div
            key={user.selectedCourses?.join(',') || 'empty'}
            className={styles.coursesGrid}
          >
            {userCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                showMinusIcon={true}
                isProfileCard={true}
              />
            ))}
          </div>
        ) : (
          <div>
            <p className={styles.emptyMessage}>
              У вас пока нет приобретенных курсов
            </p>
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
              }}
            >
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                Отладочная информация:
              </p>
              <p>
                <strong>Пользователь:</strong>{' '}
                {user ? 'Загружен' : 'Не загружен'}
              </p>
              <p>
                <strong>Курсов в selectedCourses:</strong>{' '}
                {user?.selectedCourses?.length || 0}
              </p>
              <p>
                <strong>Загружено курсов из API:</strong> {courses.length}
              </p>
              {user?.selectedCourses && user.selectedCourses.length > 0 && (
                <p style={{ marginTop: '10px', wordBreak: 'break-all' }}>
                  <strong>IDs курсов пользователя:</strong>{' '}
                  {user.selectedCourses.join(', ')}
                </p>
              )}
              {courses.length > 0 && (
                <p style={{ marginTop: '10px', wordBreak: 'break-all' }}>
                  <strong>IDs всех курсов:</strong>{' '}
                  {courses.map((c) => c._id).join(', ')}
                </p>
              )}
              {user?.selectedCourses && courses.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p>
                    <strong>Соответствия:</strong>
                  </p>
                  {user.selectedCourses.map((courseId) => {
                    const course = courses.find((c) => c._id === courseId);
                    return (
                      <p
                        key={courseId}
                        style={{ fontSize: '12px', margin: '5px 0' }}
                      >
                        ID: {courseId} -{' '}
                        {course
                          ? `✓ Найден: ${course.nameRU}`
                          : '✗ Не найден в списке курсов'}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
