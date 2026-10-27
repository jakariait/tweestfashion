import { cn } from '@/lib/utils';

function MenuItem({
  className,
  children,
  value,
  selected,
  disabled,
  dense,
  ...props
}) {
  return (
    <div
      data-slot="menu-item"
      className={cn(
        'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        selected && 'bg-accent text-accent-foreground',
        dense && 'py-1',
        className,
      )}
      data-value={value}
      data-disabled={disabled || undefined}
      {...props}
    >
      {children}
    </div>
  );
}

MenuItem.displayName = 'MenuItem';

export { MenuItem };
