'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.css';

export default function Logo() {
  return (
    <div className={styles.logoWrapper}>
      <Link href="/" className={styles.logo}>
        <Image
          src="/img/logo.png" // Ваш логотип
          alt="SkyFitnessPro"
          width={220}
          height={35}
          priority
        />
      </Link>
      <span className={styles.logoSubtitle}>
        Онлайн-тренировки для занятий дома
      </span>
    </div>
  );
}
