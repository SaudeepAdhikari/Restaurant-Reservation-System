import React, { useRef } from 'react';
import './CategoryCarousel.css';

const CATEGORIES = [
  { key: 'pizza', label: 'Pizza', icon: '🍕', trending: true },
  { key: 'nepali', label: 'Nepali', icon: '🥟', trending: false },
  { key: 'indian', label: 'Indian', icon: '🍛', trending: true },
  { key: 'cafes', label: 'Cafés', icon: '☕', trending: false },
  { key: 'chinese', label: 'Chinese', icon: '🥡', trending: false },
  { key: 'sushi', label: 'Sushi', icon: '🍣', trending: false },
  { key: 'bbq', label: 'BBQ', icon: '🔥', trending: false }
];

export default function CategoryCarousel() {
  const ref = useRef(null);

  const slide = (dir = 1) => {
    if (!ref.current) return;
    const width = ref.current.clientWidth;
    ref.current.scrollBy({ left: Math.round(width * 0.6) * dir, behavior: 'smooth' });
  };

  // basic touch drag support
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e) => {
    isDown = true;
    startX = e.pageX - ref.current.offsetLeft;
    scrollLeft = ref.current.scrollLeft;
  };
  const onMouseUp = () => { isDown = false; };
  const onMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1; // scroll-fast
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="cat-carousel-root">
      <button className="navBtn left" onClick={() => slide(-1)} aria-label="Scroll left">‹</button>
      <div
        className="cat-track"
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseUp}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {CATEGORIES.map(c => (
          <div key={c.key} className={`cat-item ${c.trending ? 'trending' : ''}`}>
            <div className="cat-icon">{c.icon}</div>
            <div className="cat-label">{c.label}</div>
            {c.trending && <div className="cat-badge">🔥 Trending</div>}
          </div>
        ))}
      </div>
      <button className="navBtn right" onClick={() => slide(1)} aria-label="Scroll right">›</button>
    </div>
  );
}
