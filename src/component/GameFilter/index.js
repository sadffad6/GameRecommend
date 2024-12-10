import React, { useState } from 'react';
import './index.scss'

const GameFilter = ({ onCategorySelect, selectedCategory }) => {
  const categories = ['全部','动作角色', '网络游戏', '策略游戏','第一人射击游戏','模拟经营','体育运动','角色扮演','动作游戏','角色扮演','第三人称射击','赛车游戏','格斗游戏','即时战略'];
  return (
    <div className="gameFilter">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategorySelect(category)}
          className={selectedCategory === category ? 'active' : ''}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default GameFilter;