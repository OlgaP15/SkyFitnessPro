'use client';

import { useEffect } from 'react';
import styles from './HomePage.module.css';
import CourseCard from './components/CourseCard';
import PromoBanner from './components/PromoBanner/PromoBanner';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchCourses } from '@/store/features/courseSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((state) => state.course);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.headingContainer}>
          <h1 className={styles.heading}>
            Начните заниматься спортом
            <br />
            и улучшите качество жизни
          </h1>
          <PromoBanner />
        </div>
        <div>Загрузка курсов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.headingContainer}>
          <h1 className={styles.heading}>
            Начните заниматься спортом
            <br />
            и улучшите качество жизни
          </h1>
          <PromoBanner />
        </div>
        <div>Ошибка загрузки курсов: {error}</div>
      </div>
    );
  }

  const sortedCourses = [...courses].sort((a, b) => {
    const orderMap = {
      'йога': 0,
      'yoga': 0,
      'стретчинг': 1,
      'stretching': 1,
      'фитнес': 2,
      'fitness': 2,
      'степ-аэробика': 3,
      'step-aerobics': 3,
      'бодифлекс': 4,
      'bodyflex': 4,
    };
    const aIndex = orderMap[a.nameRU.toLowerCase() as keyof typeof orderMap] ?? 
                   orderMap[a.nameEN.toLowerCase() as keyof typeof orderMap] ?? 999;
    const bIndex = orderMap[b.nameRU.toLowerCase() as keyof typeof orderMap] ?? 
                   orderMap[b.nameEN.toLowerCase() as keyof typeof orderMap] ?? 999;
    return aIndex - bIndex;
  });

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headingContainer}>
        <h1 className={styles.heading}>
          Начните заниматься спортом
          <br />
          и улучшите качество жизни
        </h1>
        <PromoBanner />
      </div>

      <div className={styles.coursesGrid}>
        {sortedCourses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>

      <div className={styles.scrollToTop}>
        <button onClick={scrollToTop} className={styles.topButton}>
          <span className={styles.buttonText}>
            Наверх<span className={styles.arrow}> ↑</span>
          </span>
        </button>
      </div>
    </div>
  );
}
