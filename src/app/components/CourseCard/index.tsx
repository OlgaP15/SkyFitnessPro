'use client';

import Image from 'next/image';
import Link from 'next/link';
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
  id,
  title,
  duration,
  timePerDay,
  category,
  difficulty,
  image,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`} className={styles.courseCardLink}>
      <div className={styles.courseCard}>
        <div className={styles.courseImage}>
          <Image
            src={image}
            alt={title}
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
              <h4 className={styles.courseTitleText}>{title}</h4>
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

          <div>
            <span className={styles.categoryTag}>{category}</span>
          </div>

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
        </div>
      </div>
    </Link>
  );
}