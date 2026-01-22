'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import styles from './WorkoutPage.module.css';
import { getWorkoutById, getWorkoutProgress, saveWorkoutProgress, getCourseById, getCourseProgress } from '@/app/services/course/courseApi';
import { Workout, Exercise, ProgressResponse, Course } from '@/types/shared.Types';
import ProgressModal from '@/app/components/ProgressModal/ProgressModal';
import SuccessModal from '@/app/components/SuccessModal/SuccessModal';

if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: unknown[]) => {
    const message = String(args.join(' '));
    if (
      message.includes('googleads.g.doubleclick.net') ||
      message.includes('CORS policy') ||
      message.includes('Access to XMLHttpRequest') ||
      (message.includes('PATCH') && message.includes('500')) ||
      (message.includes('net::ERR_FAILED') && message.includes('googleads'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args: unknown[]) => {
    const message = String(args.join(' '));
    if (
      message.includes('googleads.g.doubleclick.net') ||
      message.includes('CORS policy')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (
      message.includes('googleads.g.doubleclick.net') ||
      message.includes('CORS policy') ||
      message.includes('Access to XMLHttpRequest')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  
  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason || '');
    if (
      message.includes('googleads.g.doubleclick.net') ||
      message.includes('CORS policy')
    ) {
      event.preventDefault();
    }
  });
}

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
  const [hasProgress, setHasProgress] = useState(false);

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
        
        const fetchProgress = async (attempt = 1) => {
          try {
            const storageKey = `progress_${courseId}_${workoutId}`;
            const savedProgress = localStorage.getItem(storageKey);
            
            const progressData = await getWorkoutProgress(courseId, workoutId);
            if (progressData && progressData.progressData && progressData.progressData.length > 0) {
              setProgress(progressData);
              setHasProgress(true);
              localStorage.setItem(storageKey, JSON.stringify(progressData));
            } else if (savedProgress) {
              try {
                const parsedProgress = JSON.parse(savedProgress) as ProgressResponse;
                setProgress(parsedProgress);
                setHasProgress(true);
              } catch {
                setProgress(null);
                setHasProgress(false);
              }
            } else {
              setProgress(null);
              setHasProgress(false);
            }
          } catch (error) {
            const errorStatus = (error as Error & { status?: number })?.status;
            if (errorStatus === 500 && attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              fetchProgress(attempt + 1);
            } else {
              const storageKey = `progress_${courseId}_${workoutId}`;
              const savedProgress = localStorage.getItem(storageKey);
              if (savedProgress) {
                try {
                  const parsedProgress = JSON.parse(savedProgress) as ProgressResponse;
                  setProgress(parsedProgress);
                  setHasProgress(true);
                } catch {
                  setProgress(null);
                  setHasProgress(false);
                }
              } else {
                setProgress(null);
                setHasProgress(false);
              }
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
    
    const isWorkoutCompleted = workout.exercises.every((exercise, index) => {
      const completed = progressData[index] || 0;
      return completed >= exercise.quantity;
    });
    
    const localProgress: ProgressResponse = {
      workoutId,
      workoutCompleted: isWorkoutCompleted,
      progressData: progressData,
    };
    setProgress(localProgress);
    setHasProgress(true);
    
    const storageKey = `progress_${courseId}_${workoutId}`;
    localStorage.setItem(storageKey, JSON.stringify(localProgress));
    
    const courseProgressKey = `course_progress_${courseId}`;
    try {
      const courseProgressData = await getCourseProgress(courseId).catch(() => null);
      if (courseProgressData) {
        const updatedWorkoutsProgress = courseProgressData.workoutsProgress || [];
        const workoutIndex = updatedWorkoutsProgress.findIndex((wp: { workoutId: string }) => wp.workoutId === workoutId);
        if (workoutIndex >= 0) {
          updatedWorkoutsProgress[workoutIndex].workoutCompleted = isWorkoutCompleted;
          updatedWorkoutsProgress[workoutIndex].progressData = progressData;
        } else {
          updatedWorkoutsProgress.push({
            workoutId,
            workoutCompleted: isWorkoutCompleted,
            progressData: progressData,
          });
        }
        courseProgressData.workoutsProgress = updatedWorkoutsProgress;
        localStorage.setItem(courseProgressKey, JSON.stringify(courseProgressData));
      } else {
        const newCourseProgress: ProgressResponse = {
          courseId,
          courseCompleted: false,
          workoutsProgress: [{
            workoutId,
            workoutCompleted: isWorkoutCompleted,
            progressData: progressData,
          }],
          progressData: [],
        };
        localStorage.setItem(courseProgressKey, JSON.stringify(newCourseProgress));
      }
    } catch {
    }
    
    try {
      await saveWorkoutProgress(courseId, workoutId, progressData);
      
      const storageKey = `progress_${courseId}_${workoutId}`;
      const fetchUpdatedProgress = async (attempt = 1) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
          const updatedProgress = await getWorkoutProgress(courseId, workoutId);
          if (updatedProgress && updatedProgress.progressData && updatedProgress.progressData.length > 0) {
            setProgress(updatedProgress);
            setHasProgress(true);
            localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
          } else if (updatedProgress) {
            setProgress(localProgress);
            setHasProgress(true);
            localStorage.setItem(storageKey, JSON.stringify(localProgress));
          }
        } catch (progressError) {
          if (attempt < 5) {
            fetchUpdatedProgress(attempt + 1);
          } else {
            console.warn('Не удалось получить обновленный прогресс после нескольких попыток, используем локальный прогресс:', progressError);
            setProgress(localProgress);
            setHasProgress(true);
            localStorage.setItem(storageKey, JSON.stringify(localProgress));
          }
        }
      };
      
      fetchUpdatedProgress();
      
      window.dispatchEvent(new CustomEvent('workoutProgressUpdated'));
      
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сохранения прогресса';
      const errorStatus = (error as Error & { status?: number })?.status;
      
      if (errorStatus === 500) {
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
        <>
          <Link href="/profile" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Вернуться к моим курсам</span>
          </Link>
          <h1 className={styles.courseTitle}>{course.nameRU}</h1>
        </>
      )}
      <div className={styles.videoContainer}>
        <div className={styles.videoWrapper}>
          {workout.video ? (
            <iframe
              src={`${workout.video}?rel=0&modestbranding=1&controls=1`}
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
          {hasProgress || (progress && progress.progressData && progress.progressData.length > 0)
            ? 'Обновить свой прогресс'
            : 'Заполнить свой прогресс'}
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
