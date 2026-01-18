'use client';

import styles from './HomePage.module.css';
import CourseCard from './components/CourseCard';
import PromoBanner from './components/PromoBanner/PromoBanner'; 
import { courses } from './data/courses'; 

export default function Home() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className={styles.mainContainer}>
      <div className={styles.headingContainer}>
        <h1 className={styles.heading}>
          Начните заниматься спортом
          <br />и улучшите качество жизни
        </h1>
        <PromoBanner />
      </div>
      
      <div className={styles.coursesGrid}>
        {courses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
      
      <div className={styles.scrollToTop}>
        <button
          onClick={scrollToTop}
          className={styles.topButton}
        >
          <span className={styles.buttonText}>
            Наверх<span className={styles.arrow}> ↑</span>
          </span>
        </button>
      </div>
    </div>
  );
}