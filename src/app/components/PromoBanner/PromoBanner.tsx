'use client';

import Image from 'next/image';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  return (
    <div className={styles.promoBanner}>
      <div className={styles.bannerContent}>
        <div className={styles.bannerTitle}>Измени своё тело за полгода!</div>
        <div className={styles.polygonContainer}>
          <Image
            src="/img/Polygon.svg" 
            alt="Polygon decoration"
            width={30.24}
            height={35.17}
            className={styles.polygon}
          />
        </div>
      </div>
    </div>
  );
}