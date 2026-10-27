import * as React from 'react';
import { cn } from '@/lib/utils';

function IconButton({
  className,
  children,
  size = 'medium',
  color = 'default',
  edge,
  disabled,
  ...props
}) {
  return (
    <button
      data-slot="icon-button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        size === 'small' && 'size-7',
        size === 'medium' && 'size-9',
        size === 'large' && 'size-11',
        color === 'primary' && 'text-primary hover:bg-primary/10',
        color === 'secondary' && 'text-secondary-foreground',
        color === 'error' && 'text-destructive hover:bg-destructive/10',
        edge === 'start' && '-ml-2',
        edge === 'end' && '-mr-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { IconButton };
