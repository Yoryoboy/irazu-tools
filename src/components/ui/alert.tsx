import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type AlertVariant = 'default' | 'info' | 'destructive';

const variantClasses: Record<AlertVariant, string> = {
  default: 'border-zinc-800/70 bg-zinc-900/70 text-zinc-200',
  info: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  destructive: 'border-red-500/40 bg-red-500/10 text-red-200',
};

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full overflow-hidden rounded-xl border px-4 py-3 text-sm shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm font-semibold tracking-wide uppercase', className)} {...props} />;
}

function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-relaxed text-inherit', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
