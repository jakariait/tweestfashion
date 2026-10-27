import { cn } from '@/lib/utils';

function Grid({
  className,
  container,
  item,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing,
  children,
  ...props
}) {
  if (container) {
    return (
      <div
        data-slot="grid-container"
        className={cn(
          'grid',
          spacing === 1 && 'gap-1',
          spacing === 2 && 'gap-2',
          spacing === 3 && 'gap-3',
          spacing === 4 && 'gap-4',
          spacing === 5 && 'gap-5',
          spacing === 6 && 'gap-6',
          spacing === 8 && 'gap-8',
          spacing === 10 && 'gap-10',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-slot="grid-item"
      className={cn(
        xs === 12 && 'col-span-12',
        xs === 6 && 'col-span-6',
        xs === 4 && 'col-span-4',
        xs === 3 && 'col-span-3',
        xs === 2 && 'col-span-2',
        xs === 1 && 'col-span-1',
        sm && `max-sm:col-span-${sm}`,
        md && `max-md:col-span-${md}`,
        lg && `max-lg:col-span-${lg}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Grid };
