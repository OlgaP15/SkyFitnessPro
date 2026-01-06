'use client';

import { useRef } from 'react';
import styles from './courses.module.css';
import CourseCard from '../components/CourseCard';

const courses = [
  {
    id: 1,
    title: 'Йога',
    duration: '25 дней',
    timePerDay: '20-50 мин/день',
    category: 'Йога',
    difficulty: 'Сложность',
    image: '/img/curs_yoga.png',
  },
  {
    id: 2,
    title: 'Стретчинг',
    duration: '25 дней',
    timePerDay: '20-50 мин/день',
    category: 'Стретчинг',
    difficulty: 'Сложность',
    image: '/img/curs_stretching.png',
  },
  {
    id: 3,
    title: 'Фитнес',
    duration: '25 дней',
    timePerDay: '20-50 мин/день',
    category: 'Фитнес',
    difficulty: 'Сложность',
    image: '/img/curs_fitnes.png',
  },
  {
    id: 4,
    title: 'Степ-аэробика',
    duration: '25 дней',
    timePerDay: '20-50 мин/день',
    category: 'Кардио',
    difficulty: 'Сложность',
    image: '/img/curs_step-arobick.png',
  },
  {
    id: 5,
    title: 'Бодифлекс',
    duration: '25 дней',
    timePerDay: '20-50 мин/день',
    category: 'Дыхание',
    difficulty: 'Сложность',
    image: '/img/curs_bodefleks.png',
  },
];

export default function CoursesPage() {
  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      {/* Верхняя часть - заголовок */}
      <div ref={topRef} className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <p className={styles.subtitle}>Онлайн-тренировки для занятий дома</p>
            <h2 className={styles.mainTitle}>
              Начните заниматься спортом и улучшите качество жизни
            </h2>
            <p className={styles.highlightText}>
              Измени своё тело за полгода!
            </p>
          </div>
        </div>
      </div>

      {/* Сетка курсов */}
      <div className={styles.coursesGrid}>
        <div className={styles.grid}>
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>

      {/* Кнопка "Наверх" */}
      <div className={styles.scrollToTop}>
        <button
          onClick={scrollToTop}
          className={styles.topButton}
        >
          <svg 
            className={styles.icon} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 10l7-7m0 0l7 7m-7-7v18" 
            />
          </svg>
          Наверх
        </button>
      </div>

      <div className={styles.divider}></div>
    </div>
  );
}