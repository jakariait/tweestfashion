import { cn } from '@/lib/utils';

function Link({ className, underline = 'hover', color = 'primary', ...props }) {
  return (
    <a
      data-slot="link"
      className={cn(
        color === 'primary' && 'text-primary',
        color === 'secondary' && 'text-secondary-foreground',
        color === 'inherit' && 'text-inherit',
        underline === 'none' && 'no-underline',
        underline === 'hover' && 'no-underline hover:underline',
        underline === 'always' && 'underline',
        'cursor-pointer',
        className,
      )}
      {...props}
    />
  );
}

export { Link };
