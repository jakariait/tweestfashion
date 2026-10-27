import { cn } from '@/lib/utils';

function Paper({ className, elevation, square, variant, ...props }) {
  return (
    <div
      data-slot="paper"
      className={cn(
        'rounded-lg bg-card text-card-foreground shadow-sm',
        elevation === 0 && 'shadow-none',
        elevation === 1 && 'shadow-sm',
        elevation === 2 && 'shadow',
        elevation === 3 && 'shadow-md',
        elevation === 4 && 'shadow-lg',
        elevation === 5 && 'shadow-xl',
        square && 'rounded-none',
        variant === 'outlined' && 'border border-border shadow-none',
        className,
      )}
      {...props}
    />
  );
}

export { Paper };
