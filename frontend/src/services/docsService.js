/**
 * 文档服务模块
 * 提供获取文档列表和文档内容的服务
 * Authors: hovi.hyw & AI
 * Date: 2025-03-18
 */

import api from './api';

/**
 * 获取文档列表
 * 从public/docs目录获取所有Markdown文件列表
 * @returns {Promise<Array>} 文档列表，包含name和path
 */
export const getDocsList = async () => {
  try {
    // 使用容器内的路径获取文档列表
    const response = await fetch('/public/docs/?t=' + new Date().getTime());
    
    if (!response.ok) {
      throw new Error(`获取文档列表失败: ${response.status}`);
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(text, 'text/html');
    
    // 解析目录列表中的链接
    const links = Array.from(htmlDoc.querySelectorAll('a'));
    
    // 过滤出.md文件并格式化为文档列表
    const docs = links
      .filter(link => {
        const href = link.getAttribute('href');
        return href && href.endsWith('.md') && !href.includes('/');
      })
      .map(link => {
        const href = link.getAttribute('href');
        let name = href.replace('.md', '');
        name = name.replace(/[_-]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        return {
          name,
          path: `/app/public/docs/${href}`
        };
      });
    
    return docs;
  } catch (error) {
    console.error('获取文档列表失败:', error);
    throw error;
  }
};