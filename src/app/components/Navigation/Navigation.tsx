'use client';

import Logo from '../Logo';
import AuthButtons from '../AuthButtons';
import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <div className={styles.headerContent}>
          <Logo />
          <AuthButtons />
        </div>
        <span className={styles.subtitle}>
          Онлайн-тренировки для занятий дома
        </span>
      </div>
    </nav>
  );
}