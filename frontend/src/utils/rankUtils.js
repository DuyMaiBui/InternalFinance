// Hệ thống rank theo mức chi tiêu
export const RANK_TIERS = [
  {
    name: 'Tiết Kiệm Vàng',
    minAmount: 0,
    maxAmount: 500000,
    color: '#FCD34D', // Yellow
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    icon: '💰',
    description: 'Người tiết kiệm xuất sắc'
  },
  {
    name: 'Mua Sắm Bạc',
    minAmount: 500001,
    maxAmount: 1500000,
    color: '#D1D5DB', // Silver
    bgColor: '#F3F4F6',
    textColor: '#374151',
    icon: '🛒',
    description: 'Mức chi tiêu hợp lý'
  },
  {
    name: 'Chi Tiêu Đồng',
    minAmount: 1500001,
    maxAmount: 3000000,
    color: '#F97316', // Orange/Bronze
    bgColor: '#FED7AA',
    textColor: '#9A3412',
    icon: '💳',
    description: 'Chi tiêu ở mức trung bình'
  },
  {
    name: 'Mua Sắm Bạch Kim',
    minAmount: 3000001,
    maxAmount: 5000000,
    color: '#8B5CF6', // Purple
    bgColor: '#DDD6FE',
    textColor: '#5B21B6',
    icon: '💎',
    description: 'Chi tiêu khá cao'
  },
  {
    name: 'Vua Chi Tiêu',
    minAmount: 5000001,
    maxAmount: 10000000,
    color: '#EF4444', // Red
    bgColor: '#FEE2E2',
    textColor: '#991B1B',
    icon: '👑',
    description: 'Mức chi tiêu cao'
  },
  {
    name: 'Hoàng Gia Chi Tiêu',
    minAmount: 10000001,
    maxAmount: Infinity,
    color: '#7C3AED', // Purple Royal
    bgColor: '#E9D5FF',
    textColor: '#4C1D95',
    icon: '🏆',
    description: 'Mức chi tiêu cực cao'
  }
];

// Function để lấy rank dựa trên tổng chi tiêu
export const getRankByAmount = (totalAmount) => {
  for (let i = 0; i < RANK_TIERS.length; i++) {
    const tier = RANK_TIERS[i];
    if (totalAmount >= tier.minAmount && totalAmount <= tier.maxAmount) {
      return {
        ...tier,
        level: i + 1,
        progress: calculateProgress(totalAmount, tier)
      };
    }
  }
  
  // Fallback to highest tier
  return {
    ...RANK_TIERS[RANK_TIERS.length - 1],
    level: RANK_TIERS.length,
    progress: 100
  };
};

// Tính phần trăm tiến độ trong rank hiện tại
const calculateProgress = (amount, tier) => {
  if (tier.maxAmount === Infinity) {
    return 100;
  }
  
  const rangeSize = tier.maxAmount - tier.minAmount;
  const currentProgress = amount - tier.minAmount;
  return Math.min(100, Math.max(0, (currentProgress / rangeSize) * 100));
};

// Lấy rank tiếp theo
export const getNextRank = (currentLevel) => {
  if (currentLevel < RANK_TIERS.length) {
    return RANK_TIERS[currentLevel];
  }
  return null;
};

// Format số tiền còn lại để lên rank
export const getAmountToNextRank = (totalAmount, currentRank) => {
  const nextRank = getNextRank(currentRank.level);
  if (!nextRank) {
    return 0;
  }
  
  return Math.max(0, nextRank.minAmount - totalAmount);
};

// Lấy tất cả ranks để hiển thị legend
export const getAllRanks = () => {
  return RANK_TIERS.map((tier, index) => ({
    ...tier,
    level: index + 1
  }));
};

// Format range hiển thị
export const formatRankRange = (tier) => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  });
  
  if (tier.maxAmount === Infinity) {
    return `Từ ${formatter.format(tier.minAmount)}`;
  }
  
  return `${formatter.format(tier.minAmount)} - ${formatter.format(tier.maxAmount)}`;
};