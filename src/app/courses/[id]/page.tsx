'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './CoursePage.module.css';
import { courses } from '../../data/courses'; // Импортируем те же данные

// Расширяем данные для страницы курса
const coursesData = courses.map(course => ({
  ...course,
  description: `Подробное описание курса ${course.title}`,
  fullDescription: `Полное описание курса ${course.title}. Этот курс поможет вам достичь ваших целей.`,
  benefits: [
    'Улучшение физической формы',
    'Повышение энергии',
    'Улучшение самочувствия',
    'Развитие дисциплины'
  ],
  instructor: 'Инструктор курса',
  instructorBio: 'Опытный специалист в своей области'
}));

export default function CoursePage() {
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const course = coursesData.find(c => c.id === courseId);

  if (!course) {
    return <div className={styles.notFound}>Курс не найден</div>;
  }

  return (
    <div className={styles.coursePage}>
      <div className={styles.heroSection}>
        <div className={styles.heroImage}>
          <Image
            src={course.image}
            alt={course.title}
            width={1200}
            height={500}
            className={styles.image}
            priority
          />
          <div className={styles.heroOverlay}>
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseDescription}>{course.description}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.mainContent}>
          <div className={styles.section}>
            <h2>О курсе</h2>
            <p>{course.fullDescription}</p>
          </div>

          <div className={styles.section}>
            <h2>Преимущества</h2>
            <ul className={styles.benefitsList}>
              {course.benefits.map((benefit, index) => (
                <li key={index} className={styles.benefitItem}>
                  <span className={styles.checkmark}>✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Программа</h2>
            <div className={styles.programDetails}>
              <div className={styles.programItem}>
                <Image
                  src="/img/Calendar.svg"
                  alt="Длительность"
                  width={24}
                  height={24}
                />
                <div>
                  <h4>Длительность</h4>
                  <p>{course.duration}</p>
                </div>
              </div>
              <div className={styles.programItem}>
                <Image
                  src="/img/Icon.svg"
                  alt="Время"
                  width={24}
                  height={24}
                />
                <div>
                  <h4>Время в день</h4>
                  <p>{course.timePerDay}</p>
                </div>
              </div>
              <div className={styles.programItem}>
                <Image
                  src="/img/mingcute_signal-fill.svg"
                  alt="Сложность"
                  width={24}
                  height={24}
                />
                <div>
                  <h4>Сложность</h4>
                  <p>{course.difficulty}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.instructorCard}>
            <h3>Инструктор</h3>
            <div className={styles.instructorInfo}>
              <h4>{course.instructor}</h4>
              <p>{course.instructorBio}</p>
            </div>
          </div>

          <button className={styles.startCourseButton}>
            Начать курс
          </button>

          <div className={styles.courseStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>25</span>
              <span className={styles.statLabel}>уроков</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>онлайн</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>доступ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}