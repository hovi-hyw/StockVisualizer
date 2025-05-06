// frontend/src/contexts/ThemeContext.js
/**
 * 主题上下文
 * 提供全局主题状态管理和切换功能
 * Authors: hovi.hyw & AI
 * Date: 2025-03-22
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// 创建主题上下文
const ThemeContext = createContext();

/**
 * 主题提供者组件
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} 主题提供者组件
 */
export const ThemeProvider = ({ children }) => {
  // 从本地存储中获取主题设置，默认为'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 当主题变化时，更新文档根元素的data-theme属性和body类
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // 添加或移除body的dark-theme类
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题的自定义Hook
 * @returns {Object} 包含主题状态和切换函数的对象
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
};