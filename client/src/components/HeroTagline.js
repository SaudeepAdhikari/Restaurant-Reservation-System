import React, { useEffect, useState } from 'react';
import styles from '../styles/modules/HomePage.module.css';

const TAGLINES = [
  'Local favorites and hidden gems.',
  'Book instantly, dine happily.',
  'Curated menus, real reviews.',
  'Reserve tonight, celebrate tomorrow.'
];

export default function HeroTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % TAGLINES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className={`${styles.heroTagline} ${visible ? styles.fadeIn : styles.fadeOut}`}>
      {TAGLINES[index]}
    </p>
  );
}
