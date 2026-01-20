'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './CourseCard.module.css';
import { Course } from '@/types/shared.Types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const duration = course.durationInDays
    ? `${course.durationInDays} дней`
    : '';
  const timePerDay = course.dailyDurationInMinutes
    ? `${course.dailyDurationInMinutes.from}-${course.dailyDurationInMinutes.to} мин/день`
    : '';
  const difficulty = course.difficulty || '';

  const getCourseImage = (nameRU: string, nameEN: string) => {
    const images: Record<string, string> = {
      йога: '/images/yoga.jpg',
      yoga: '/images/yoga.jpg',
      стретчинг: '/images/stretching.jpg',
      stretching: '/images/stretching.jpg',
      фитнес: '/images/fitness.jpg',
      fitness: '/images/fitness.jpg',
      'степ-аэробика': '/images/step-aerobics.jpg',
      'step-aerobics': '/images/step-aerobics.jpg',
      бодифлекс: '/images/bodyflex.jpg',
      bodyflex: '/images/bodyflex.jpg',
    };
    return images[nameRU.toLowerCase()] || images[nameEN.toLowerCase()] || '/images/yoga.jpg';
  };

  const imageSrc = getCourseImage(course.nameRU, course.nameEN);

  return (
    <Link href={`/courses/${course._id}`} className={styles.courseCardLink}>
      <div className={styles.courseCard}>
        <div className={styles.courseImage}>
          <Image
            src={imageSrc}
            alt={course.nameRU}
            width={360}
            height={325}
            className={styles.image}
            priority
          />
          <Image
            src="/img/Add-in-Circle.svg"
            alt="Добавить"
            width={28}
            height={28}
            className={styles.addIcon}
          />
        </div>

        <div className={styles.courseContent}>
          <div className={styles.courseInfo}>
            <div className={styles.infoLeft}>
              <h4 className={styles.courseTitleText}>{course.nameRU}</h4>
              <div className={styles.inlineInfo}>
                <Image
                  src="/img/Calendar.svg"
                  alt="Календарь"
                  width={20}
                  height={20}
                />
                <span className={styles.courseParam}>{duration}</span>
                <Image
                  src="/img/Icon.svg"
                  alt="Время"
                  width={20}
                  height={20}
                />
                <span className={styles.courseParam}>{timePerDay}</span>
              </div>
            </div>
          </div>
          {difficulty && (
          <div className={styles.difficultyTag}>
            <Image
              src="/img/mingcute_signal-fill.svg"
              alt="Сложность"
              width={20}
              height={20}
              style={{ marginRight: '8px' }}
            />
            <span className={styles.courseParam}>{difficulty}</span>
          </div>
          )}
        </div>
      </div>
    </Link>
  );
}
