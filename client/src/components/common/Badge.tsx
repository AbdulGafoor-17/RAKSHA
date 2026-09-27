import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'active' | 'dispatched' | 'resolved' | 'investigating' | 'citizen' | 'authority' | 'shelter' | 'default';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  icon
}) => {
  const variantStyles = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    active: 'bg-red-500/20 text-red-300 border-red-500/40',
    dispatched: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    investigating: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    citizen: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    authority: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    shelter: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    default: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-mono border backdrop-blur-sm tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="text-current opacity-80">{icon}</span>}
      {children}
    </span>
  );
};
