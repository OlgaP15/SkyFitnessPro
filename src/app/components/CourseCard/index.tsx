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
          width={360}
          height={325}
          className={styles.image}
          priority
        />
        <Image
          src="/img/Add-in-Circle.svg"
          alt="Добавить"
          width={32}
          height={32}
          className={styles.addIcon}
        />
      </div>

      <div className={styles.courseContent}>
        <div className={styles.courseInfo}>
          <div className={styles.infoLeft}>
            <h4 className={styles.courseTitleText}>{title}</h4>
            <div className={styles.inlineInfo}>
              <div className={styles.durationTag}>
                <Image
                  src="/img/Calendar.svg"
                  alt="Календарь"
                  width={18}
                  height={18}
                />
                <span className={styles.durationText}>{duration}</span>
              </div>
              <div className={styles.timeTag}>
                <Image src="/img/Icon.svg"
                  alt="Время"
                  width={18} 
                  height={18} 
                />
                <span className={styles.courseParam}>{timePerDay}</span>
              </div>
              <div className={styles.difficultyTag}>
                <Image
                  src="/img/mingcute_signal-fill.svg"
                  alt="Сложность"
                  width={18}
                  height={18}
                />
                <span className={styles.courseParam}>{difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
