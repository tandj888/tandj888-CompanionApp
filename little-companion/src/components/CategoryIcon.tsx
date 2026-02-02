import React from 'react';

interface CategoryIconProps {
  icon: string;
  className?: string;
  size?: number | string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, className = '', size }) => {
  const isRemixIcon = icon.startsWith('ri-');
  
  // Combine custom classes with potential size classes if passed
  const combinedClass = `${icon} ${className}`.trim();

  if (isRemixIcon) {
    return (
      <i 
        className={combinedClass} 
        style={size ? { fontSize: size } : undefined}
      />
    );
  }

  // Fallback for emojis
  return (
    <span 
      className={className} 
      style={size ? { fontSize: size, lineHeight: 1 } : undefined}
    >
      {icon}
    </span>
  );
};
