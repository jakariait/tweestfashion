import { cn } from '@/lib/utils';

const variants = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  h6: 'scroll-m-20 text-base font-semibold tracking-tight',
  subtitle1: 'text-base text-muted-foreground',
  subtitle2: 'text-sm text-muted-foreground',
  body1: 'text-base',
  body2: 'text-sm',
  caption: 'text-xs text-muted-foreground',
  overline: 'text-xs uppercase tracking-wider text-muted-foreground',
};

const defaultVariant = 'body1';

function Typography({
  className,
  variant = defaultVariant,
  component,
  gutterBottom,
  noWrap,
  paragraph,
  color,
  align,
  ...props
}) {
  const Comp = component || (paragraph ? 'p' : 'span');

  return (
    <Comp
      className={cn(
        variants[variant] || variants[defaultVariant],
        gutterBottom && 'mb-2',
        noWrap && 'truncate',
        color === 'textSecondary' && 'text-muted-foreground',
        color === 'primary' && 'text-primary',
        color === 'secondary' && 'text-secondary',
        color === 'error' && 'text-destructive',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className,
      )}
      {...props}
    />
  );
}

export { Typography };
