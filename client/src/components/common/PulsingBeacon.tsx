import React from 'react';

interface PulsingBeaconProps {
  status?: 'active' | 'warning' | 'critical' | 'safe' | 'offline';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PulsingBeacon: React.FC<PulsingBeaconProps> = ({
  status = 'safe',
  label,
  size = 'md'
}) => {
  const colorMap = {
    critical: {
      ping: 'bg-red-500',
      dot: 'bg-red-500',
      text: 'text-red-400',
      border: 'border-red-500/30'
    },
    warning: {
      ping: 'bg-amber-500',
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    active: {
      ping: 'bg-cyan-500',
      dot: 'bg-cyan-400',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30'
    },
    safe: {
      ping: 'bg-emerald-500',
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    offline: {
      ping: 'bg-slate-500',
      dot: 'bg-slate-400',
      text: 'text-slate-400',
      border: 'border-slate-500/30'
    }
  };

  const sizeMap = {
    sm: { container: 'h-2 w-2', ping: 'h-2 w-2', dot: 'h-2 w-2', text: 'text-[11px]' },
    md: { container: 'h-2.5 w-2.5', ping: 'h-2.5 w-2.5', dot: 'h-2.5 w-2.5', text: 'text-xs' },
    lg: { container: 'h-3.5 w-3.5', ping: 'h-3.5 w-3.5', dot: 'h-3.5 w-3.5', text: 'text-sm' }
  };

  const colors = colorMap[status];
  const sizes = sizeMap[size];

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`relative flex ${sizes.container}`}>
        {status !== 'offline' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.ping} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${sizes.dot} ${colors.dot} shadow-[0_0_8px_currentColor]`}
        />
      </span>
      {label && (
        <span className={`font-mono font-medium tracking-wide uppercase ${sizes.text} ${colors.text}`}>
          {label}
        </span>
      )}
    </div>
  );
};
