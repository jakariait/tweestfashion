import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

function CircularProgress({
  className,
  size = 40,
  color = 'primary',
  ...props
}) {
  return (
    <Loader2
      data-slot="circular-progress"
      className={cn(
        'animate-spin text-primary',
        color === 'secondary' && 'text-secondary',
        color === 'error' && 'text-destructive',
        color === 'inherit' && 'text-current',
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

export { CircularProgress };
