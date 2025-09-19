import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300',
  secondary:
    'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-500/50',
  outline:
    'border border-zinc-700 text-zinc-100 hover:bg-zinc-800/70 focus-visible:ring-2 focus-visible:ring-zinc-500/40',
  ghost: 'text-zinc-300 hover:bg-zinc-800/60 focus-visible:ring-2 focus-visible:ring-zinc-500/30',
  destructive:
    'bg-red-500 text-white hover:bg-red-400 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2 text-sm font-medium',
  sm: 'h-9 px-3 text-xs font-medium',
  lg: 'h-11 px-6 text-base font-semibold',
  icon: 'h-10 w-10 flex items-center justify-center',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
