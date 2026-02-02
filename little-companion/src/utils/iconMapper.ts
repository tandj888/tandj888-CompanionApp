export const keywordMap: Record<string, string> = {
  // Outdoor / Nature
  '户外': 'ri-sun-line',
  'outdoor': 'ri-sun-line',
  '旅行': 'ri-plane-line',
  'travel': 'ri-plane-line',
  '露营': 'ri-tent-line',
  'camping': 'ri-tent-line',
  '风景': 'ri-landscape-line',
  'landscape': 'ri-landscape-line',
  '自然': 'ri-leaf-line',
  'nature': 'ri-leaf-line',

  // Sports / Health
  '运动': 'ri-run-line',
  'sport': 'ri-run-line',
  '健身': 'ri-weight-line',
  'gym': 'ri-weight-line',
  '健康': 'ri-heart-pulse-line',
  'health': 'ri-heart-pulse-line',
  '跑步': 'ri-run-line',
  'run': 'ri-run-line',
  '游泳': 'ri-drop-line',
  'swim': 'ri-drop-line',
  '瑜伽': 'ri-body-scan-line',
  'yoga': 'ri-body-scan-line',

  // Work / Study
  '工作': 'ri-briefcase-line',
  'work': 'ri-briefcase-line',
  '学习': 'ri-book-line',
  'study': 'ri-book-line',
  '阅读': 'ri-book-read-line',
  'reading': 'ri-book-read-line',
  '写作': 'ri-pencil-line',
  'writing': 'ri-pencil-line',
  '编程': 'ri-code-line',
  'coding': 'ri-code-line',
  '会议': 'ri-discuss-line',
  'meeting': 'ri-discuss-line',

  // Life / Home
  '生活': 'ri-cup-line',
  'life': 'ri-cup-line',
  '家庭': 'ri-home-smile-line',
  'family': 'ri-home-smile-line',
  '家务': 'ri-home-gear-line',
  'housework': 'ri-home-gear-line',
  '美食': 'ri-restaurant-line',
  'food': 'ri-restaurant-line',
  '烹饪': 'ri-knife-blood-line', // maybe just knife? ri-knife-line
  'cooking': 'ri-knife-line',
  '购物': 'ri-shopping-cart-line',
  'shopping': 'ri-shopping-cart-line',
  '电影': 'ri-movie-line',
  'movie': 'ri-movie-line',
  '音乐': 'ri-music-line',
  'music': 'ri-music-line',
  '游戏': 'ri-gamepad-line',
  'game': 'ri-gamepad-line',
  
  // Finance
  '财务': 'ri-money-dollar-circle-line',
  'finance': 'ri-money-dollar-circle-line',
  '理财': 'ri-stock-line',
  'investment': 'ri-stock-line',
  '存钱': 'ri-piggy-bank-line',
  'save': 'ri-piggy-bank-line',

  // Social
  '社交': 'ri-group-line',
  'social': 'ri-group-line',
  '朋友': 'ri-emotion-happy-line',
  'friend': 'ri-emotion-happy-line',
  '聚会': 'ri-goblet-line',
  'party': 'ri-goblet-line',

  // Other
  '习惯': 'ri-calendar-check-line',
  'habit': 'ri-calendar-check-line',
  '目标': 'ri-flag-line',
  'goal': 'ri-flag-line',
  '计划': 'ri-todo-line',
  'plan': 'ri-todo-line',
};

export const safeIcons = [
  'ri-star-line',
  'ri-heart-line',
  'ri-flag-line',
  'ri-bookmark-line',
  'ri-lightbulb-line',
  'ri-trophy-line',
  'ri-medal-line',
  'ri-vip-diamond-line',
  'ri-gift-line',
  'ri-rocket-line',
  'ri-fire-line',
  'ri-thunderstorms-line',
  'ri-moon-line',
  'ri-sun-line',
  'ri-cloud-line',
  'ri-umbrella-line',
  'ri-key-line',
  'ri-lock-line',
  'ri-shield-line',
  'ri-shopping-bag-line',
  'ri-wallet-line',
  'ri-compass-3-line',
  'ri-map-pin-line',
  'ri-navigation-line',
];

export const getIconForCategory = (name: string): string => {
  if (!name) return 'ri-star-line';
  
  const lowerName = name.toLowerCase();
  
  // 1. Exact or partial match in keyword map
  for (const [key, icon] of Object.entries(keywordMap)) {
    if (lowerName.includes(key.toLowerCase())) {
      return icon;
    }
  }

  // 2. Random fallback
  // Use a simple hash of the name to get a consistent random icon for the same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % safeIcons.length;
  return safeIcons[index];
};
