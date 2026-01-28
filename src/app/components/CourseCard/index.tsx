'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import styles from './CourseCard.module.css';
import { Course, ProgressResponse } from '@/types/shared.Types';
import {
  getCourseProgress,
  deleteUserCourse,
  addUserCourse,
  resetCourseProgress,
  getCourseWorkouts,
} from '@/app/services/course/courseApi';
import { getMe } from '@/app/services/auth/authApi';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  setUser,
  removeCourseFromUser,
  addCourseToUser,
} from '@/store/features/authSlice';
import { useModal } from '@/context/modalContext';
import { useAppStore } from '@/store/store';
import WorkoutSelectionModal from '../WorkoutSelectionModal/WorkoutSelectionModal';
interface CourseCardProps {
  course: Course;
  showMinusIcon?: boolean;
  isProfileCard?: boolean;
}

export default function CourseCard({
  course,
  showMinusIcon = false,
  isProfileCard = false,
}: CourseCardProps) {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { isAuth, user } = useAppSelector((state) => state.auth);
  const { openLogin } = useModal();
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const duration = course.durationInDays ? `${course.durationInDays} дней` : '';
  const timePerDay = course.dailyDurationInMinutes
    ? `${course.dailyDurationInMinutes.from}-${course.dailyDurationInMinutes.to} мин/день`
    : '';
  const difficulty = course.difficulty || '';

  const getCourseImage = (nameRU: string, nameEN: string) => {
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

  useEffect(() => {
    if (isProfileCard) {
      const fetchProgress = async () => {
        try {
          const allWorkouts = await getCourseWorkouts(course._id);
          const totalWorkoutsInCourse = allWorkouts.length;

          const courseProgressKey = `course_progress_${course._id}`;
          const savedCourseProgress = localStorage.getItem(courseProgressKey);

          const progressData: ProgressResponse = await getCourseProgress(
            course._id,
          );

          if (
            progressData.workoutsProgress &&
            progressData.workoutsProgress.length > 0
          ) {
            const completedWorkouts = progressData.workoutsProgress.filter(
              (wp) => wp.workoutCompleted,
            ).length;
            const progressPercent =
              totalWorkoutsInCourse > 0
                ? Math.round((completedWorkouts / totalWorkoutsInCourse) * 100)
                : 0;
            setProgress(progressPercent);
          } else if (savedCourseProgress) {
            try {
              const parsedProgress = JSON.parse(
                savedCourseProgress,
              ) as ProgressResponse;
              if (
                parsedProgress.workoutsProgress &&
                parsedProgress.workoutsProgress.length > 0
              ) {
                const completedWorkouts =
                  parsedProgress.workoutsProgress.filter(
                    (wp) => wp.workoutCompleted,
                  ).length;
                const progressPercent =
                  totalWorkoutsInCourse > 0
                    ? Math.round(
                        (completedWorkouts / totalWorkoutsInCourse) * 100,
                      )
                    : 0;
                setProgress(progressPercent);
              } else {
                setProgress(0);
              }
            } catch {
              setProgress(0);
            }
          } else {
            setProgress(0);
          }
        } catch (error) {
          const errorStatus = (error as Error & { status?: number })?.status;

          if (errorStatus === 500) {
            try {
              const allWorkouts = await getCourseWorkouts(course._id);
              const totalWorkoutsInCourse = allWorkouts.length;

              const courseProgressKey = `course_progress_${course._id}`;
              const savedCourseProgress =
                localStorage.getItem(courseProgressKey);
              if (savedCourseProgress) {
                try {
                  const parsedProgress = JSON.parse(
                    savedCourseProgress,
                  ) as ProgressResponse;
                  if (
                    parsedProgress.workoutsProgress &&
                    parsedProgress.workoutsProgress.length > 0
                  ) {
                    const completedWorkouts =
                      parsedProgress.workoutsProgress.filter(
                        (wp) => wp.workoutCompleted,
                      ).length;
                    const progressPercent =
                      totalWorkoutsInCourse > 0
                        ? Math.round(
                            (completedWorkouts / totalWorkoutsInCourse) * 100,
                          )
                        : 0;
                    setProgress(progressPercent);
                  } else {
                    setProgress(0);
                  }
                } catch {
                  setProgress(0);
                }
              } else {
                setProgress(0);
              }
            } catch {
              setProgress(0);
            }
          } else {
            setProgress(0);
          }
        }
      };

      fetchProgress();

      const handleProgressUpdate = () => {
        fetchProgress();
      };
      window.addEventListener('workoutProgressUpdated', handleProgressUpdate);

      return () => {
        window.removeEventListener(
          'workoutProgressUpdated',
          handleProgressUpdate,
        );
      };
    }
  }, [isProfileCard, course._id]);

  const handleDeleteCourse = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      await deleteUserCourse(course._id);
      dispatch(removeCourseFromUser(course._id));
      toast.success('Курс успешно удален!');

      setTimeout(async () => {
        try {
          const updatedUser = await getMe();
          dispatch(setUser(updatedUser));
        } catch {}
      }, 500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Ошибка удаления курса';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (progress === 100) {
      if (loading) return;
      setLoading(true);
      try {
        await resetCourseProgress(course._id);
        setProgress(0);
        toast.success('Прогресс курса сброшен!');
        const progressData: ProgressResponse = await getCourseProgress(
          course._id,
        );
        if (
          progressData.workoutsProgress &&
          progressData.workoutsProgress.length > 0
        ) {
          const completedWorkouts = progressData.workoutsProgress.filter(
            (wp) => wp.workoutCompleted,
          ).length;
          const totalWorkouts = progressData.workoutsProgress.length;
          const progressPercent = Math.round(
            (completedWorkouts / totalWorkouts) * 100,
          );
          setProgress(progressPercent);
        } else {
          setProgress(0);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Ошибка сброса прогресса';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setIsWorkoutModalOpen(true);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isProfileCard) {
      e.preventDefault();
      e.stopPropagation();
      setIsWorkoutModalOpen(true);
    }
  };

  const handleAddCourse = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuth) {
      openLogin();
      return;
    }

    if (user?.selectedCourses?.includes(course._id)) {
      toast.info('Курс уже добавлен');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await addUserCourse(course._id);

      dispatch(addCourseToUser(course._id));
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
        dispatch(addCourseToUser(course._id));
        toast.success('Курс добавлен!');
      } else {
        toast.error(errorMessage || 'Ошибка добавления курса');
      }
    } finally {
      setLoading(false);
    }
  };

  const isCourseAdded = user?.selectedCourses?.includes(course._id) || false;

  const imageSrc = getCourseImage(course.nameRU, course.nameEN);

  const cardContent = (
    <div
      className={`${styles.courseCard} ${isProfileCard ? styles.profileCard : ''}`}
    >
      <div
        className={`${styles.courseImage} ${isProfileCard ? styles.profileImage : ''}`}
      >
        <Image
          src={imageSrc}
          alt={course.nameRU}
          width={360}
          height={325}
          className={styles.image}
          priority
        />
        {showMinusIcon && (
          <button
            onClick={handleDeleteCourse}
            className={styles.deleteButton}
            disabled={loading}
            aria-label="Удалить курс"
          >
            <Image
              src="/images/minus.svg"
              alt="Удалить"
              width={28}
              height={28}
              className={styles.addIcon}
            />
          </button>
        )}
        {!showMinusIcon && !isProfileCard && (
          <button
            onClick={handleAddCourse}
            className={styles.addButton}
            disabled={loading || isCourseAdded}
            aria-label="Добавить курс"
          >
            <Image
              src="/img/Add-in-Circle.svg"
              alt="Добавить"
              width={28}
              height={28}
              className={styles.addIcon}
            />
          </button>
        )}
      </div>

      <div className={styles.courseContent}>
        <div className={styles.courseInfo}>
          <div className={styles.infoLeft}>
            <h4 className={styles.courseTitleText}>{course.nameRU}</h4>
            <div className={styles.inlineInfo}>
              <Image
                src="/img/Calendar.svg"
                alt="Календарь"
                width={20}
                height={20}
              />
              <span className={styles.courseParam}>{duration}</span>
              <Image src="/img/Icon.svg" alt="Время" width={20} height={20} />
              <span className={styles.courseParam}>{timePerDay}</span>
            </div>
          </div>
        </div>
        {difficulty && (
          <div className={styles.difficultyTag}>
            <Image
              src="/img/mingcute_signal-fill.svg"
              alt="Сложность"
              width={20}
              height={20}
              style={{ marginRight: '8px' }}
            />
            <span className={styles.courseParam}>{difficulty}</span>
          </div>
        )}
        {isProfileCard && (
          <>
            <div className={styles.progressSection}>
              <span className={styles.progressText}>Прогресс {progress}%</span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button onClick={handleContinue} className={styles.continueButton}>
              {progress === 0
                ? 'Начать тренировки'
                : progress === 100
                  ? 'Начать заново'
                  : 'Продолжить'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (isProfileCard) {
    return (
      <>
        <div onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          {cardContent}
        </div>
        {isWorkoutModalOpen && (
          <WorkoutSelectionModal
            courseId={course._id}
            courseName={course.nameRU}
            onClose={() => setIsWorkoutModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <Link href={`/courses/${course._id}`} className={styles.courseCardLink}>
      {cardContent}
    </Link>
  );
}
