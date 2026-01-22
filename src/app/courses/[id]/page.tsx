'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import styles from './CoursePage.module.css';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/store';
import { fetchCourseById } from '@/store/features/courseSlice';
import { useModal } from '@/context/modalContex';
import { addUserCourse } from '@/app/services/course/courseApi';
import { getMe } from '@/app/services/auth/authApi';
import { setUser, addCourseToUser } from '@/store/features/authSlice';

const getCourseImage = (nameRU: string, nameEN: string) => {
  const images: Record<string, string> = {
    йога: '/images/curs_yoga.png',
    yoga: '/images/curs_yoga.png',
    стретчинг: '/images/curs_stretching.png',
    stretching: '/images/curs_stretching.png',
    фитнес: '/images/curs_fitnes.png',
    fitness: '/images/curs_fitnes.png',
    'степ-аэробика': '/images/curs_step-arobick.png',
    'step-aerobics': '/images/curs_step-arobick.png',
    бодифлекс: '/images/curs_bodefleks.png',
    bodyflex: '/images/curs_bodefleks.png',
  };
  return images[nameRU.toLowerCase()] || images[nameEN.toLowerCase()] || '/images/curs_yoga.png';
};

export default function CoursePage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { currentCourse, loading, error } = useAppSelector(
    (state) => state.course
  );
  const { isAuth } = useAppSelector((state) => state.auth);
  const { openLogin } = useModal();

  const courseId = params.id as string;

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
    }
  }, [courseId, dispatch]);

  if (loading) {
    return (
      <div className={styles.coursePage}>
        <div>Загрузка курса...</div>
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <div className={styles.coursePage}>
        <div className={styles.notFound}>
          {error || 'Курс не найден'}
        </div>
      </div>
    );
  }

  const courseImageSrc = getCourseImage(currentCourse.nameRU, currentCourse.nameEN);

  const handleAddCourse = async () => {
    if (!isAuth) {
      openLogin();
      return;
    }

    try {
      await addUserCourse(courseId);
      
      dispatch(addCourseToUser(courseId));
      toast.success('Курс успешно добавлен!');
      
      const updateUserData = async () => {
        try {
          const currentState = store.getState();
          const currentUser = currentState.auth.user;
          const updatedUser = await getMe();
          
          if (currentUser && currentUser.selectedCourses) {
            const localCourses = currentUser.selectedCourses;
            const serverCourses = updatedUser.selectedCourses || [];
            
            const allCoursesSet = new Set([...localCourses, ...serverCourses]);
            const allCourses = Array.from(allCoursesSet);
            updatedUser.selectedCourses = allCourses;
          }
          
          dispatch(setUser(updatedUser));
        } catch {
        }
      };
      
      setTimeout(updateUserData, 2000);
      setTimeout(updateUserData, 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      const errorStatus = (error as Error & { status?: number })?.status;
      
      if (errorStatus === 500 || errorMessage.includes('500')) {
        dispatch(addCourseToUser(courseId));
        toast.success('Курс добавлен!');
      } else {
        toast.error(errorMessage || 'Ошибка добавления курса');
      }
    }
  };

  return (
    <div className={styles.coursePage}>
      <div className={styles.heroBanner}>
        <Image
          src={courseImageSrc}
          alt={currentCourse.nameRU}
          width={1160}
          height={310}
          className={styles.heroImage}
          priority
        />
      </div>

      <div className={styles.suitableSection}>
        <h2 className={styles.sectionTitle}>Подойдет для вас, если:</h2>
        <div className={styles.suitableCards}>
          {currentCourse.fitting && currentCourse.fitting.length > 0 ? (
            currentCourse.fitting.slice(0, 3).map((item, index) => (
              <div key={index} className={styles.suitableCard}>
                <div className={styles.cardNumber}>{index + 1}</div>
                <p className={styles.cardText}>{item}</p>
              </div>
            ))
          ) : (
            <>
              <div className={styles.suitableCard}>
                <div className={styles.cardNumber}>1</div>
                <p className={styles.cardText}>Давно хотели попробовать, но не решались начать</p>
              </div>
              <div className={styles.suitableCard}>
                <div className={styles.cardNumber}>2</div>
                <p className={styles.cardText}>Хотите улучшить свое здоровье и самочувствие</p>
              </div>
              <div className={styles.suitableCard}>
                <div className={styles.cardNumber}>3</div>
                <p className={styles.cardText}>Ищете активность, полезную для тела и души</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.directionsSection}>
        <h2 className={styles.sectionTitle}>Направления</h2>
        <div className={styles.directionsCard}>
          {currentCourse.directions && currentCourse.directions.length > 0 ? (
            <ul className={styles.directionsList}>
              {currentCourse.directions.map((direction, index) => (
                <li key={index} className={styles.directionItem}>
                  <Image
                    src="/images/Sparcle.svg"
                    alt=""
                    width={26}
                    height={26}
                    className={styles.sparcleIcon}
                  />
                  <span className={styles.directionText}>{direction}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className={styles.directionsList}>
              <li className={styles.directionItem}>
                <Image
                  src="/images/Sparcle.svg"
                  alt=""
                  width={26}
                  height={26}
                  className={styles.sparcleIcon}
                />
                <span className={styles.directionText}>Базовые направления</span>
              </li>
            </ul>
          )}
        </div>
      </div>

      <div className={styles.startSection}>
        <div className={styles.startCard}>
          <div className={styles.startContent}>
            <h2 className={styles.startTitle}>Начните путь к новому телу</h2>
            <ul className={styles.benefitsList}>
              <li className={styles.benefitItem}>проработка всех групп мышц</li>
              <li className={styles.benefitItem}>тренировка суставов</li>
              <li className={styles.benefitItem}>улучшение циркуляции крови</li>
              <li className={styles.benefitItem}>упражнения заряжают бодростью</li>
              <li className={styles.benefitItem}>помогают противостоять стрессам</li>
            </ul>
            <button 
              className={styles.startButton}
              onClick={handleAddCourse}
            >
              {isAuth ? 'Добавить курс' : 'Войдите, чтобы добавить курс'}
            </button>
          </div>
          <div className={styles.startImageWrapper}>
            <div className={styles.imageContainer}>
              <Image
                src="/images/begun.svg"
                alt="Начните путь к новому телу"
                width={487}
                height={542}
                className={styles.startImage}
              />
              <Image
                src="/images/polosa_big.svg"
                alt=""
                width={400}
                height={400}
                className={styles.decorBig}
              />
              <Image
                src="/images/poloska.svg"
                alt=""
                width={200}
                height={200}
                className={styles.decorSmall}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
