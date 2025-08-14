import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Attempt to load theme settings from localStorage
  const getInitialDarkMode = () => {
    const storedDarkMode = localStorage.getItem('isDarkMode');
    return storedDarkMode ? JSON.parse(storedDarkMode) : false;
  };

  const getInitialAccentColor = () => {
    return localStorage.getItem('accentColor') || '#1890ff'; // Default Ant Design blue
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [accentColor, setAccentColor] = useState(getInitialAccentColor);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => setIsDarkMode(prevMode => !prevMode);

  const themeConfig = useMemo(() => ({
    token: {
      colorPrimary: accentColor,
      // You can add more token customizations here:
      // colorLink: accentColor,
      // borderRadius: 4,
    },
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    // Example of component-level customization
    // components: {
    //   Button: {
    //     colorPrimary: accentColor,
    //     algorithm: true, // Enables algorithm for components
    //   },
    // },
  }), [isDarkMode, accentColor]);

  const themeContextValue = {
    isDarkMode,
    toggleTheme,
    accentColor,
    setAccentColor,
    antdConfig: themeConfig, // Pass the generated config
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};