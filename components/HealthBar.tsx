
import React from 'react';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  color: string;
}

const HealthBar: React.FC<HealthBarProps> = ({ health, maxHealth, color }) => {
  const widthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  return (
    <div className="w-full bg-black/60 rounded-full h-5 border border-gray-500/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] p-0.5">
      <div
        className={`relative ${color} h-full rounded-full transition-all duration-500 ease-out overflow-hidden`}
        style={{ width: `${widthPercentage}%` }}
      >
        {/* Glossy highlight effect */}
        <div className="absolute top-0 left-0 h-1/2 w-full bg-gradient-to-b from-white/40 to-transparent rounded-t-full"></div>
      </div>
    </div>
  );
};

export default HealthBar;