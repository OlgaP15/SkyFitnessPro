'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from './WorkoutPage.module.css';
import { getWorkoutById, getWorkoutProgress, saveWorkoutProgress, getCourseById } from '@/app/services/course/courseApi';
import { Workout, Exercise, ProgressResponse, Course } from '@/types/shared.Types';
import ProgressModal from '@/app/components/ProgressModal/ProgressModal';

export default function WorkoutPage() {
  const params = useParams();
  const courseId = params.id as string;
  const workoutId = params.workoutId as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workoutData, courseData, progressData] = await Promise.all([
          getWorkoutById(workoutId),
          getCourseById(courseId).catch(() => null),
          getWorkoutProgress(courseId, workoutId).catch(() => null),
        ]);
        setWorkout(workoutData);
        setCourse(courseData);
        setProgress(progressData);
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
    try {
      await saveWorkoutProgress(courseId, workoutId, progressData);
      const updatedProgress = await getWorkoutProgress(courseId, workoutId);
      setProgress(updatedProgress);
      setIsModalOpen(false);
      toast.success('Прогресс успешно сохранен!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сохранения прогресса';
      toast.error(errorMessage);
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
              {column.map((exercise, exerciseIndex) => {
                const globalIndex = workout.exercises.findIndex(
                  (e) => e._id === exercise._id
                );
                const progressPercent = getExerciseProgress(globalIndex);
                return (
                  <div key={exercise._id} className={styles.exerciseItem}>
                    <div className={styles.exerciseName}>{exercise.name}</div>
                    <div className={styles.exerciseProgress}>
                      {progressPercent}%
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
    </div>
  );
}
