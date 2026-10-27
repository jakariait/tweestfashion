import { cn } from '@/lib/utils';

function InputAdornment({ className, position, children, ...props }) {
  return (
    <div
      data-slot="input-adornment"
      className={cn(
        'flex items-center text-muted-foreground',
        position === 'start' && 'mr-2',
        position === 'end' && 'ml-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { InputAdornment };
