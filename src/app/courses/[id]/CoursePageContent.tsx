'use client';

import Image from 'next/image';
import { toast } from 'react-toastify';
import styles from './CoursePage.module.css';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/store';
import { useModal } from '@/context/modalContext';
import { addUserCourse } from '@/app/services/course/courseApi';
import { getMe } from '@/app/services/auth/authApi';
import { setUser, addCourseToUser } from '@/store/features/authSlice';
import { addPendingCourse } from '@/app/services/pendingCourses';
import { Course } from '@/types/shared.Types';

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
  return (
    images[nameRU.toLowerCase()] ||
    images[nameEN.toLowerCase()] ||
    '/images/curs_yoga.png'
  );
};

const getCourseImageMobile = (nameRU: string, nameEN: string) => {
  const images: Record<string, string> = {
    йога: '/images/yoga.jpg',
    yoga: '/images/yoga.jpg',
    стретчинг: '/images/stretching.jpg',
    stretching: '/images/stretching.jpg',
    фитнес: '/images/fitness.jpg',
    fitness: '/images/fitness.jpg',
    'степ-аэробика': '/images/step-aerobics.jpg',
    'step-aerobics': '/images/step-aerobics.jpg',
    бодифлекс: '/images/bodyflex.jpg',
    bodyflex: '/images/bodyflex.jpg',
  };
  return (
    images[nameRU.toLowerCase()] ||
    images[nameEN.toLowerCase()] ||
    '/images/yoga.jpg'
  );
};

interface CoursePageContentProps {
  course: Course;
}

export default function CoursePageContent({ course }: CoursePageContentProps) {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { isAuth } = useAppSelector((state) => state.auth);
  const { openLogin } = useModal();

  const courseId = course._id;
  const courseImageSrc = getCourseImage(course.nameRU, course.nameEN);
  const courseImageSrcMobile = getCourseImageMobile(course.nameRU, course.nameEN);

  const handleAddCourse = async () => {
    if (!isAuth) {
      openLogin();
      return;
    }

    try {
      const result = await addUserCourse(courseId);
      dispatch(addCourseToUser(courseId));
      if ((result as { _was500?: boolean })._was500) {
        addPendingCourse(courseId);
      }
      toast.success('Курс успешно добавлен!');

      const updateUserData = async () => {
        try {
          const currentState = store.getState();
          const currentUser = currentState.auth.user;
          const updatedUser = await getMe();

          if (currentUser?.selectedCourses) {
            const localCourses = currentUser.selectedCourses;
            const serverCourses = updatedUser.selectedCourses || [];
            const allCoursesSet = new Set([...localCourses, ...serverCourses]);
            updatedUser.selectedCourses = Array.from(allCoursesSet);
          }

          dispatch(setUser(updatedUser));
        } catch {}
      };

      setTimeout(updateUserData, 2000);
      setTimeout(updateUserData, 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      const errorStatus = (error as Error & { status?: number })?.status;

      if (errorStatus === 500 || errorMessage.includes('500')) {
        dispatch(addCourseToUser(courseId));
        addPendingCourse(courseId);
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
          alt={course.nameRU}
          width={1160}
          height={310}
          sizes="1160px"
          className={`${styles.heroImage} ${styles.heroImageDesktop}`}
          priority
        />
        <Image
          src={courseImageSrcMobile}
          alt={course.nameRU}
          width={343}
          height={389}
          sizes="343px"
          className={`${styles.heroImage} ${styles.heroImageMobile}`}
          priority
        />
      </div>

      <div className={styles.suitableSection}>
        <h2 className={styles.sectionTitle}>Подойдет для вас, если:</h2>
        <div className={styles.suitableCards}>
          {course.fitting && course.fitting.length > 0 ? (
            course.fitting.slice(0, 3).map((item, index) => (
              <div key={index} className={styles.suitableCard}>
                <div className={styles.cardNumber}>{index + 1}</div>
                <p className={styles.cardText}>{item}</p>
              </div>
            ))
          ) : (
            <>
              <div className={styles.suitableCard}>
                <div className={styles.cardNumber}>1</div>
                <p className={styles.cardText}>
                  Давно хотели попробовать, но не решались начать
                </p>
              </div>
              <div className={styles.suitableCard}>
                <div className={styles.cardNumber}>2</div>
                <p className={styles.cardText}>
                  Хотите улучшить свое здоровье и самочувствие
                </p>
              </div>
              <div className={styles.suitableCard}>
                <div className={styles.cardNumber}>3</div>
                <p className={styles.cardText}>
                  Ищете активность, полезную для тела и души
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.directionsSection}>
        <h2 className={styles.sectionTitle}>Направления</h2>
        <div className={styles.directionsCard}>
          {course.directions && course.directions.length > 0 ? (
            <ul className={styles.directionsList}>
              {course.directions.map((direction, index) => (
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
                <span className={styles.directionText}>
                  Базовые направления
                </span>
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
              <li className={styles.benefitItem}>
                упражнения заряжают бодростью
              </li>
              <li className={styles.benefitItem}>
                помогают противостоять стрессам
              </li>
            </ul>
            <button className={styles.startButton} onClick={handleAddCourse}>
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
