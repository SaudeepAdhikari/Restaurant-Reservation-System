import React, { useState, useRef } from 'react';
import Autocomplete from './Autocomplete';
import FilterMenu from './FilterMenu';
import '../styles/modules/SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ rating: null, budget: null, openOnly: false });
  const inputRef = useRef(null);

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const sr = new SpeechRecognition();
    sr.lang = 'en-US';
    sr.interimResults = false;
    sr.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      setQuery(txt);
      inputRef.current && (inputRef.current.value = txt);
    };
    sr.onerror = () => {};
    sr.start();
  };

  return (
    <div className="searchbar-root">
      <div className="search-input-wrap">
        <input
          ref={inputRef}
          className="searchBar"
          placeholder="Search by name, cuisine, or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="micBtn" onClick={handleVoice} aria-label="Voice search">🎤</button>
        <button className="searchBtn">Search</button>
        <FilterMenu filters={filters} onChange={setFilters} />
      </div>
      <Autocomplete query={query} onSelect={(val) => { setQuery(val); inputRef.current && (inputRef.current.value = val); }} />
    </div>
  );
}
