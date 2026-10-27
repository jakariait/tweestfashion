import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function TextField({
  className,
  label,
  variant,
  size,
  color,
  fullWidth = true,
  error,
  helperText,
  InputProps,
  ...props
}) {
  return (
    <div
      className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}
    >
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        id={props.id}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive/50',
          InputProps?.className,
        )}
        {...InputProps}
        {...props}
      />
      {helperText && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export { TextField };
