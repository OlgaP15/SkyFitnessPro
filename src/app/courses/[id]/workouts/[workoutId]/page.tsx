'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from './WorkoutPage.module.css';
import { getWorkoutById, getWorkoutProgress, saveWorkoutProgress, getCourseById } from '@/app/services/course/courseApi';
import { Workout, Exercise, ProgressResponse, Course } from '@/types/shared.Types';
import ProgressModal from '@/app/components/ProgressModal/ProgressModal';
import SuccessModal from '@/app/components/SuccessModal/SuccessModal';

export default function WorkoutPage() {
  const params = useParams();
  const courseId = params.id as string;
  const workoutId = params.workoutId as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workoutData, courseData] = await Promise.all([
          getWorkoutById(workoutId),
          getCourseById(courseId).catch(() => null),
        ]);
        setWorkout(workoutData);
        setCourse(courseData);
        
        // Загружаем прогресс отдельно с повторными попытками
        const fetchProgress = async (attempt = 1) => {
          try {
            const progressData = await getWorkoutProgress(courseId, workoutId);
            if (progressData && progressData.progressData && progressData.progressData.length > 0) {
              setProgress(progressData);
            } else {
              // Если прогресс пустой, устанавливаем пустой прогресс
              setProgress(null);
            }
          } catch (error) {
            // Если ошибка 500, пробуем еще раз (максимум 3 попытки)
            const errorStatus = (error as Error & { status?: number })?.status;
            if (errorStatus === 500 && attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              fetchProgress(attempt + 1);
            } else {
              // После всех попыток устанавливаем null
              setProgress(null);
            }
          }
        };
        
        fetchProgress();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки данных';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (workoutId && courseId) {
      fetchData();
    }
  }, [workoutId, courseId]);

  const handleSaveProgress = async (progressData: number[]) => {
    if (!workout) return;
    
    // Проверяем, завершена ли тренировка (все упражнения выполнены на 100%)
    const isWorkoutCompleted = workout.exercises.every((exercise, index) => {
      const completed = progressData[index] || 0;
      return completed >= exercise.quantity;
    });
    
    // Сохраняем локальный прогресс сразу для мгновенного отображения
    const localProgress: ProgressResponse = {
      workoutId,
      workoutCompleted: isWorkoutCompleted,
      progressData: progressData,
    };
    setProgress(localProgress);
    
    try {
      // Сохраняем прогресс
      await saveWorkoutProgress(courseId, workoutId, progressData);
      
      // Пытаемся получить обновленный прогресс с сервера с задержкой и повторными попытками
      // Серверу нужно время, чтобы обработать сохранение
      const fetchUpdatedProgress = async (attempt = 1) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1500 * attempt)); // Увеличена задержка
          const updatedProgress = await getWorkoutProgress(courseId, workoutId);
          // Обновляем прогресс только если получили валидные данные
          if (updatedProgress && updatedProgress.progressData && updatedProgress.progressData.length > 0) {
            setProgress(updatedProgress);
          } else if (updatedProgress) {
            // Если прогресс пустой, но ответ успешный, используем локальные данные
            setProgress(localProgress);
          }
        } catch (progressError) {
          // Если не удалось получить прогресс, пробуем еще раз (максимум 5 попыток)
          if (attempt < 5) {
            fetchUpdatedProgress(attempt + 1);
          } else {
            // После всех попыток используем локальный прогресс
            console.warn('Не удалось получить обновленный прогресс после нескольких попыток, используем локальный прогресс:', progressError);
            setProgress(localProgress);
          }
        }
      };
      
      // Запускаем получение обновленного прогресса в фоне
      fetchUpdatedProgress();
      
      setIsModalOpen(false);
      // Показываем модальное окно успеха вместо toast
      setIsSuccessModalOpen(true);
    } catch (error) {
      // Ошибка уже обработана в saveWorkoutProgress для 500 статуса
      // Здесь обрабатываем только критические ошибки
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сохранения прогресса';
      const errorStatus = (error as Error & { status?: number })?.status;
      
      // Для 500 все равно обновляем локальный прогресс и показываем успех
      if (errorStatus === 500) {
        // Локальный прогресс уже обновлен выше
        setIsModalOpen(false);
        setIsSuccessModalOpen(true);
      } else if (errorStatus !== 500) {
        toast.error(errorMessage);
      }
    }
  };

  const getExerciseProgress = (exerciseIndex: number): number => {
    if (!progress || !progress.progressData || !workout) return 0;
    if (exerciseIndex >= progress.progressData.length) return 0;
    
    const completed = progress.progressData[exerciseIndex];
    const total = workout.exercises[exerciseIndex]?.quantity || 1;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const distributeExercisesIntoColumns = (exercises: Exercise[]): Exercise[][] => {
    const columns: Exercise[][] = [[], [], []];
    exercises.forEach((exercise, index) => {
      columns[index % 3].push(exercise);
    });
    return columns;
  };

  if (loading) {
    return (
      <div className={styles.workoutPage}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className={styles.workoutPage}>
        <div className={styles.error}>Тренировка не найдена</div>
      </div>
    );
  }

  const columns = distributeExercisesIntoColumns(workout.exercises);

  return (
    <div className={styles.workoutPage}>
      {course && (
        <h1 className={styles.courseTitle}>{course.nameRU}</h1>
      )}
      <div className={styles.videoContainer}>
        <div className={styles.videoWrapper}>
          {workout.video ? (
            <iframe
              src={workout.video}
              className={styles.video}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={workout.name}
            />
          ) : (
            <div className={styles.videoPlaceholder}>
              <div className={styles.playButton}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="40" fill="rgba(0, 0, 0, 0.6)"/>
                  <path d="M32 25L32 55L55 40L32 25Z" fill="white"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.exercisesSection}>
        <h2 className={styles.sectionTitle}>
          Упражнения {workout.name}
        </h2>
        <div className={styles.exercisesGrid}>
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className={styles.exerciseColumn}>
              {column.map((exercise) => {
                const globalIndex = workout.exercises.findIndex(
                  (e) => e._id === exercise._id
                );
                const progressPercent = getExerciseProgress(globalIndex);
                return (
                  <div key={exercise._id} className={styles.exerciseItem}>
                    <div className={styles.exerciseName}>{exercise.name}</div>
                    <div className={styles.exerciseProgressContainer}>
                      <div className={styles.exerciseProgress}>
                        {progressPercent}%
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressBarFill} 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <button
          className={styles.progressButton}
          onClick={() => setIsModalOpen(true)}
        >
          Заполнить свой прогресс
        </button>
      </div>

      {isModalOpen && workout && (
        <ProgressModal
          workout={workout}
          currentProgress={progress?.progressData || []}
          onSave={handleSaveProgress}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isSuccessModalOpen && (
        <SuccessModal
          message="Ваш прогресс засчитан!"
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </div>
  );
}
