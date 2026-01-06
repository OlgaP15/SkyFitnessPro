'use client';

import Logo from '../Logo';
import AuthButtons from '../AuthButtons';
import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Logo />
        <AuthButtons />
      </div>
    </nav>
  );
}