import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'secondary';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-emerald-500/90 text-zinc-950',
  secondary: 'bg-zinc-800 text-zinc-200',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
