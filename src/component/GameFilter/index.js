import React, { useState } from 'react';
import './index.scss'

const GameFilter = ({ onCategorySelect, selectedCategory }) => {
  const categories = ['全部','冒险', '动作', '动作冒险','即时战略','卡牌','大型多人在线','射击','文字冒险','格斗','模拟','益智','第一人称射击','模拟','策略'];
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