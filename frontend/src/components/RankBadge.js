import React from 'react';
import { getRankByAmount, getAmountToNextRank, getNextRank } from '../utils/rankUtils';

const RankBadge = ({ totalAmount, showDetails = true, size = 'md' }) => {
  const rank = getRankByAmount(totalAmount);
  const nextRank = getNextRank(rank.level);
  const amountToNext = getAmountToNextRank(totalAmount, rank);

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'text-sm',
      text: 'text-xs'
    },
    md: {
      badge: 'px-3 py-1 text-sm',
      icon: 'text-base',
      text: 'text-sm'
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      icon: 'text-lg',
      text: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  if (!showDetails) {
    return (
      <span className={`inline-flex items-center rounded-full font-medium bg-gray-200 text-gray-700 ${currentSize.badge}`}>
        <span className={currentSize.icon}>•</span>
        <span className="ml-1">••••••</span>
      </span>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col items-start">
      <span 
        className={`inline-flex items-center rounded-full font-medium ${currentSize.badge}`}
        style={{ 
          backgroundColor: rank.bgColor, 
          color: rank.textColor,
          border: `1px solid ${rank.color}`
        }}
        title={rank.description}
      >
        <span className={currentSize.icon}>{rank.icon}</span>
        <span className="ml-1">{rank.name}</span>
      </span>
      
      {nextRank && amountToNext > 0 && size !== 'sm' && (
        <div className="mt-1">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-16 bg-gray-200 rounded-full h-1 mr-2">
              <div 
                className="h-1 rounded-full"
                style={{ 
                  width: `${rank.progress}%`,
                  backgroundColor: rank.color
                }}
              ></div>
            </div>
            <span>
              {formatCurrency(amountToNext)} để lên {nextRank.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankBadge;