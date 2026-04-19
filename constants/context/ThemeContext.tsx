import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: { bg: '#fff', text: '#1A1A1A', card: '#fff', border: '#f0f0f0', subText: '#666' }
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    text: isDarkMode ? '#fff' : '#1A1A1A',
    card: isDarkMode ? '#1E1E1E' : '#fff',
    border: isDarkMode ? '#333' : '#f0f0f0',
    subText: isDarkMode ? '#aaa' : '#666'
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);