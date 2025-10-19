import React from 'react';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  color: string;
}

const HealthBar: React.FC<HealthBarProps> = ({ health, maxHealth, color }) => {
  const widthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  const isGreen = color.includes('green');

  return (
    <div className="w-full bg-black/70 rounded-full h-8 border-2 border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] p-1">
      <div
        className={`relative h-full rounded-full transition-all duration-500 ease-out overflow-hidden bg-gradient-to-b ${isGreen ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'}`}
        style={{ width: `${widthPercentage}%` }}
      >
        {/* Glossy highlight effect */}
        <div className="absolute top-0 left-0 h-1/2 w-full bg-gradient-to-b from-white/50 to-transparent rounded-t-full"></div>
      </div>
    </div>
  );
};

export default HealthBar;