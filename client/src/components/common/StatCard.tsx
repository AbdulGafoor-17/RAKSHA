import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'red' | 'amber' | 'cyan' | 'green' | 'blue';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'cyan',
  trend,
  onClick
}) => {
  const styles = {
    red: {
      border: 'border-red-500/30 hover:border-red-500/60',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/30',
      valueColor: 'text-red-300'
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      valueColor: 'text-amber-300'
    },
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      valueColor: 'text-cyan-300'
    },
    green: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      valueColor: 'text-emerald-300'
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-500/60',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      valueColor: 'text-blue-300'
    }
  };

  const currentStyle = styles[variant];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${currentStyle.border} ${currentStyle.glow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">{title}</p>
          <h4 className={`text-2xl sm:text-3xl font-bold font-display mt-1 ${currentStyle.valueColor}`}>
            {value}
          </h4>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-sans">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl border ${currentStyle.iconBg}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{trend}</span>
          <span className="text-slate-500">REAL-TIME</span>
        </div>
      )}
    </motion.div>
  );
};
