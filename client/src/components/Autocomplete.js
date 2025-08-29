import React, { useMemo } from 'react';
import '../styles/modules/Autocomplete.css';

const SAMPLE_SUGGESTIONS = [
  'Pizzeria Napoli',
  'The Spice Route',
  'Café Mocha',
  'Mountain Dine',
  'The Sushi Place',
  'Tandoori Express',
  'Green Garden Cafe',
  'Riverside Grill'
];

export default function Autocomplete({ query = '', onSelect = () => {} }) {
  const suggestions = useMemo(() => {
    if (!query || query.trim().length < 1) return [];
    const q = query.toLowerCase();
    return SAMPLE_SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0,6);
  }, [query]);

  if (!suggestions.length) return null;

  return (
    <ul className="autocomplete-list" role="listbox">
      {suggestions.map((s, idx) => (
        <li key={idx} className="autocomplete-item" onMouseDown={() => onSelect(s)}>
          {s}
        </li>
      ))}
    </ul>
  );
}
