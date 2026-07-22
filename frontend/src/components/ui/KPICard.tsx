import React from 'react';
import { GlassCard } from './GlassCard';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'cyan';
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  trendLabel,
  color = 'cyan'
}) => {
  const colorMap = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400'
  };

  const bgMap = {
    blue: 'bg-blue-500/10',
    green: 'bg-emerald-500/10',
    amber: 'bg-amber-500/10',
    purple: 'bg-purple-500/10',
    cyan: 'bg-cyan-500/10'
  };

  return (
    <GlassCard className="p-5 flex flex-col" intensity="medium" hoverEffect>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg ${bgMap[color]}`}>
            <Icon className={`w-5 h-5 ${colorMap[color]}`} />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-slate-400 text-sm font-medium">{unit}</span>}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-700/50">
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-slate-500 text-xs">{trendLabel}</span>}
        </div>
      )}
    </GlassCard>
  );
};
