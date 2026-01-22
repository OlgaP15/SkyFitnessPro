'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './WorkoutSelectionModal.module.css';
import { Workout, ProgressResponse } from '@/types/shared.Types';
import { getCourseWorkouts, getCourseProgress } from '@/app/services/course/courseApi';

interface WorkoutSelectionModalProps {
  courseId: string;
  courseName: string;
  onClose: () => void;
}

interface WorkoutWithProgress extends Workout {
  completed: boolean;
}

export default function WorkoutSelectionModal({
  courseId,
  courseName,
  onClose,
}: WorkoutSelectionModalProps) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutWithProgress[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const workoutsData = await getCourseWorkouts(courseId);
        
        // Загружаем прогресс отдельно с повторными попытками
        const fetchProgress = async (attempt = 1): Promise<ProgressResponse | null> => {
          try {
            const progressData = await getCourseProgress(courseId);
            return progressData;
          } catch (error) {
            // Если ошибка 500, пробуем еще раз (максимум 3 попытки)
            const errorStatus = (error as Error & { status?: number })?.status;
            if (errorStatus === 500 && attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              return fetchProgress(attempt + 1);
            }
            return null;
          }
        };
        
        const progressData = await fetchProgress();

        // Создаем карту прогресса для быстрого поиска
        const progressMap = new Map<string, boolean>();
        
        // Загружаем данные из API
        if (progressData?.workoutsProgress) {
          progressData.workoutsProgress.forEach((wp) => {
            progressMap.set(wp.workoutId, wp.workoutCompleted);
          });
        }
        
        // Также проверяем localStorage для общего прогресса курса (резервная копия)
        const courseProgressKey = `course_progress_${courseId}`;
        const savedCourseProgress = localStorage.getItem(courseProgressKey);
        if (savedCourseProgress) {
          try {
            const parsedCourseProgress = JSON.parse(savedCourseProgress) as ProgressResponse;
            if (parsedCourseProgress.workoutsProgress) {
              parsedCourseProgress.workoutsProgress.forEach((wp) => {
                // Используем данные из localStorage, если их нет в API или если они более свежие
                if (!progressMap.has(wp.workoutId) || wp.workoutCompleted) {
                  progressMap.set(wp.workoutId, wp.workoutCompleted);
                }
              });
            }
          } catch {
            // Игнорируем ошибки парсинга
          }
        }
        
        // Также проверяем localStorage для каждой тренировки (дополнительная резервная копия)
        workoutsData.forEach((workout) => {
          const storageKey = `progress_${courseId}_${workout._id}`;
          const savedProgress = localStorage.getItem(storageKey);
          if (savedProgress) {
            try {
              const parsedProgress = JSON.parse(savedProgress) as ProgressResponse;
              // Если тренировка завершена локально, но не в API, используем локальные данные
              if (parsedProgress.workoutCompleted && !progressMap.get(workout._id)) {
                progressMap.set(workout._id, true);
              }
            } catch {
              // Игнорируем ошибки парсинга
            }
          }
        });

        // Объединяем данные тренировок с прогрессом
        const workoutsWithProgress: WorkoutWithProgress[] = workoutsData.map((workout) => ({
          ...workout,
          completed: progressMap.get(workout._id) || false,
        }));

        setWorkouts(workoutsWithProgress);
        
        // Выбираем первую незавершенную тренировку или первую тренировку
        const firstIncomplete = workoutsWithProgress.find((w) => !w.completed);
        if (firstIncomplete) {
          setSelectedWorkoutId(firstIncomplete._id);
        } else if (workoutsWithProgress.length > 0) {
          setSelectedWorkoutId(workoutsWithProgress[0]._id);
        }
      } catch (error) {
        console.error('Ошибка загрузки тренировок:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchWorkouts();
      
      // Обновляем данные при изменении localStorage (когда прогресс сохраняется)
      // Используем кастомное событие вместо storage события, так как storage срабатывает только между вкладками
      const handleCustomStorageUpdate = () => {
        fetchWorkouts();
      };
      
      // Слушаем кастомное событие для обновления данных
      window.addEventListener('workoutProgressUpdated', handleCustomStorageUpdate);
      
      return () => {
        window.removeEventListener('workoutProgressUpdated', handleCustomStorageUpdate);
      };
    }
  }, [courseId]);

  const handleWorkoutClick = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
  };

  const handleStart = () => {
    if (selectedWorkoutId) {
      router.push(`/courses/${courseId}/workouts/${selectedWorkoutId}`);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Выберите тренировку</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles.loading}>Загрузка тренировок...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Выберите тренировку</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.workoutsList}>
          {workouts.map((workout, index) => {
            const workoutNumber = index + 1;
            const dayText = `${courseName} / ${workoutNumber} день`;
            
            return (
              <div key={workout._id}>
                <div
                  className={`${styles.workoutItem} ${
                    selectedWorkoutId === workout._id ? styles.workoutItemSelected : ''
                  }`}
                  onClick={() => handleWorkoutClick(workout._id)}
                >
                  <div className={styles.workoutStatus}>
                    {workout.completed ? (
                      <div className={styles.statusIconCompleted}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" fill="#BCEC30" stroke="#BCEC30" strokeWidth="2"/>
                          <path d="M6 10 L9 13 L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ) : (
                      <div className={styles.statusIcon}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" stroke="#E0E0E0" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.workoutInfo}>
                    <div className={styles.workoutTitle}>{workout.name}</div>
                    <div className={styles.workoutSubtitle}>{dayText}</div>
                  </div>
                </div>
                {index < workouts.length - 1 && <div className={styles.workoutDivider} />}
              </div>
            );
          })}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.startButton}
            onClick={handleStart}
            disabled={!selectedWorkoutId}
          >
            Начать
          </button>
        </div>
      </div>
    </div>
  );
}
