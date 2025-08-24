import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

// Predefined color palette
export const PREDEFINED_COLORS = [
  { name: 'Blue', value: '#1890ff', description: 'Classic Blue' },
  { name: 'Green', value: '#52c41a', description: 'Success Green' },
  { name: 'Purple', value: '#722ed1', description: 'Royal Purple' },
  { name: 'Orange', value: '#fa8c16', description: 'Vibrant Orange' },
  { name: 'Red', value: '#f5222d', description: 'Bold Red' },
  { name: 'Cyan', value: '#13c2c2', description: 'Ocean Cyan' },
  { name: 'Pink', value: '#eb2f96', description: 'Hot Pink' },
  { name: 'Gold', value: '#faad14', description: 'Golden Yellow' },
  { name: 'Lime', value: '#a0d911', description: 'Fresh Lime' },
  { name: 'Magenta', value: '#c41d7f', description: 'Deep Magenta' }
];

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