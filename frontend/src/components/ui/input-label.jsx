import { cn } from '@/lib/utils';

function InputLabel({
  className,
  children,
  shrink,
  disableAnimation,
  variant,
  color,
  ...props
}) {
  return (
    <label
      data-slot="input-label"
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export { InputLabel };
