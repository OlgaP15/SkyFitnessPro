'use client';

import Image from 'next/image';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  id: number;
  title: string;
  duration: string;
  timePerDay: string;
  category: string;
  difficulty: string;
  image: string;
}

export default function CourseCard({
  title,
  duration,
  timePerDay,
  category,
  difficulty,
  image,
}: CourseCardProps) {
  return (
    <div className={styles.courseCard}>
      <div className={styles.courseImage}>
        <Image
          src={image}
          alt={title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className={styles.imageOverlay}>
          <h3 className={styles.courseTitle}>{title}</h3>
        </div>
      </div>
      
      <div className={styles.courseContent}>
        <div className={styles.courseInfo}>
          <div className={styles.infoLeft}>
            <h4>{title}</h4>
            <p className={styles.duration}>• {duration}</p>
            <p className={styles.timePerDay}>• {timePerDay}</p>
          </div>
        </div>
        
        <div>
          <span className={styles.categoryTag}>
            {category}
          </span>
        </div>
        
        <div className={styles.difficultyTag}>
          {difficulty}
        </div>
        
        <button className={styles.startButton}>
          Начать курс
        </button>
      </div>
    </div>
  );
}