import React from 'react';
import styles from '../styles/modules/HomePage.module.css';

export default function HeroBackground() {
  return (
    <div className={styles.heroBg} aria-hidden>
      <div className={styles.shape + ' ' + styles.shape1}></div>
      <div className={styles.shape + ' ' + styles.shape2}></div>
      <div className={styles.shape + ' ' + styles.shape3}></div>
      <div className={styles.shape + ' ' + styles.shape4}></div>
    </div>
  );
}
