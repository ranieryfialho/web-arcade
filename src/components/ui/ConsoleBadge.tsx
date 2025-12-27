import { clsx } from 'clsx';

type ConsoleType = 'SNES' | 'MEGA_DRIVE' | 'GBA';

interface ConsoleBadgeProps {
  type: string;
  className?: string;
}

export function ConsoleBadge({ type, className }: ConsoleBadgeProps) {
  const config: Record<string, { label: string; style: string }> = {
    SNES: {
      label: 'SNES',
      style: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
    },
    MEGA_DRIVE: {
      label: 'Mega Drive',
      style: 'bg-red-900/20 text-red-300 border-red-500/50',
    },
    GBA: {
      label: 'GBA',
      style: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    },
  };

  const current = config[type] || { 
    label: type, 
    style: 'bg-gray-500/20 text-gray-300 border-gray-500/50' 
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        current.style,
        className
      )}
    >
      {current.label}
    </span>
  );
}