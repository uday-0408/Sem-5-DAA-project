import React, { useState, useEffect } from 'react';
import Visualizer from './pages/Visualizer';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Visualizer darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
  );
}

export default App;
