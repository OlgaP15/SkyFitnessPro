'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ProgressModal.module.css';
import { Workout } from '@/types/shared.Types';

interface ProgressModalProps {
  workout: Workout;
  currentProgress: number[];
  onSave: (progressData: number[]) => void;
  onClose: () => void;
}

export default function ProgressModal({
  workout,
  currentProgress,
  onSave,
  onClose,
}: ProgressModalProps) {
  // Используем useMemo для вычисления текущего прогресса
  const computedProgress = workout.exercises.map((exercise, index) => {
    return currentProgress[index] || 0;
  });

  const [progressData, setProgressData] = useState<number[]>(computedProgress);
  const [errors, setErrors] = useState<string[]>([]);
  const prevProgressRef = useRef<string>('');

  // Обновляем данные когда workout или currentProgress изменились, используя setTimeout для асинхронности
  useEffect(() => {
    const newProgress = workout.exercises.map((exercise, index) => {
      return currentProgress[index] || 0;
    });
    
    // Используем JSON.stringify для сравнения, чтобы избежать лишних обновлений
    const newProgressKey = JSON.stringify(newProgress);
    const prevProgressKey = prevProgressRef.current;
    
    if (newProgressKey !== prevProgressKey) {
      // Используем setTimeout для асинхронного обновления, чтобы избежать синхронного setState
      const timer = setTimeout(() => {
        setProgressData(newProgress);
        prevProgressRef.current = newProgressKey;
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [workout, currentProgress]);

  const handleChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      return;
    }
    
    const updatedProgress = [...progressData];
    updatedProgress[index] = numValue;
    setProgressData(updatedProgress);
    
    // Очищаем ошибки при изменении
    if (errors[index]) {
      const updatedErrors = [...errors];
      updatedErrors[index] = '';
      setErrors(updatedErrors);
    }
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];
    let isValid = true;

    workout.exercises.forEach((exercise, index) => {
      const value = progressData[index] || 0;
      if (value > exercise.quantity) {
        newErrors[index] = `Не может быть больше ${exercise.quantity}`;
        isValid = false;
      } else if (value < 0) {
        newErrors[index] = 'Не может быть отрицательным';
        isValid = false;
      } else {
        newErrors[index] = '';
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onSave(progressData);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Заполнить свой прогресс</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.exercisesList}>
            {workout.exercises.map((exercise, index) => (
              <div key={exercise._id} className={styles.exerciseRow}>
                <label className={styles.exerciseLabel}>
                  {exercise.name}
                  <span className={styles.exerciseQuantity}>
                    (максимум: {exercise.quantity})
                  </span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    min="0"
                    max={exercise.quantity}
                    value={progressData[index] || 0}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className={`${styles.input} ${errors[index] ? styles.inputError : ''}`}
                    placeholder="0"
                  />
                  <span className={styles.inputSuffix}>/ {exercise.quantity}</span>
                </div>
                {errors[index] && (
                  <span className={styles.errorMessage}>{errors[index]}</span>
                )}
              </div>
            ))}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Отмена
            </button>
            <button type="submit" className={styles.saveButton}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
