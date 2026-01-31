'use client';

import styles from '../../HomePage.module.css';
import CourseCard from '../CourseCard';
import PromoBanner from '../PromoBanner/PromoBanner';
import { Course } from '@/types/shared.Types';

const ORDER_MAP: Record<string, number> = {
  йога: 0,
  yoga: 0,
  стретчинг: 1,
  stretching: 1,
  фитнес: 2,
  fitness: 2,
  'степ-аэробика': 3,
  'step-aerobics': 3,
  бодифлекс: 4,
  bodyflex: 4,
};

function sortCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const aIndex = ORDER_MAP[a.nameRU.toLowerCase()] ?? ORDER_MAP[a.nameEN.toLowerCase()] ?? 999;
    const bIndex = ORDER_MAP[b.nameRU.toLowerCase()] ?? ORDER_MAP[b.nameEN.toLowerCase()] ?? 999;
    return aIndex - bIndex;
  });
}

interface HomeContentProps {
  courses: Course[];
}

export default function HomeContent({ courses }: HomeContentProps) {
  const sortedCourses = sortCourses(courses);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
