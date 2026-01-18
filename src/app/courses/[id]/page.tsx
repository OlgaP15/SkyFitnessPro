'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './CoursePage.module.css';
import { courses } from '../../data/courses';

export default function CoursePage() {
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <div className={styles.notFound}>Курс не найден</div>;
  }

  return (
    <div className={styles.coursePage}>
      <div className={styles.heroSection}>
        <div className={styles.heroImage}>
          {/* Используем ДРУГУЮ картинку для страницы курса */}
          <Image
            src={course.courseImage} // Используем courseImage вместо image
            alt={course.title}
            width={1160}
            height={310}
            className={styles.image}
            priority
          />
          <div className={styles.heroOverlay}>
            <h1 className={styles.courseTitle}></h1>
            <p className={styles.courseDescription}></p>
          </div>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.mainContent}>
          <div className={styles.section}>
            <h2>Подойдет для вас, если:</h2>
            <p>{course.fullDescription_1}</p>
            <p>{course.fullDescription_2}</p>
            <p>{course.fullDescription_3}</p>
          </div>

          <div className={styles.section}>
            <h2>Направления</h2>
            <ul className={styles.benefitsList}>
              {course.benefits.map((benefit, index) => (
                <li key={index} className={styles.benefitItem}>
                  <span className={styles.checkmark}>✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.instructorCard}>
            <h2>Начните путь к новому телу</h2>
            <div className={styles.instructorInfo}>
              <p>{course.courseDescript}</p>
            </div>
          </div>

          <button className={styles.startCourseButton}>
            Войдите, чтобы добавить курс
          </button>
        </div>
      </div>
    </div>
  );
}