import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

function Accordion({
  className,
  expanded,
  defaultExpanded,
  onChange,
  children,
  ...props
}) {
  const [open, setOpen] = React.useState(expanded ?? defaultExpanded ?? false);

  React.useEffect(() => {
    if (expanded !== undefined) setOpen(expanded);
  }, [expanded]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (onChange) onChange(null, next);
  };

  const childrenArray = React.Children.toArray(children);
  const summary = childrenArray.find(
    (child) => child.type?._accordionType === 'summary',
  );
  const details = childrenArray.find(
    (child) => child.type?._accordionType === 'details',
  );

  const icon = summary?.props?.icon;
  const description = summary?.props?.description;

  return (
    <div
      data-slot="accordion"
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'group relative overflow-hidden rounded-md border bg-card text-foreground transition-all duration-200',
        open
          ? 'border-primary/30 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_8px_24px_-8px_rgba(0,0,0,0.08)]'
          : 'border-border/60 shadow-sm',
        'hover:border-border',
        className,
      )}
      {...props}
    >
      {/* Accent indicator — signals active state without shouting */}
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-[3px] bg-primary transition-transform duration-300 ease-out',
          open ? 'scale-y-100' : 'scale-y-0',
        )}
        style={{ transformOrigin: 'top' }}
        aria-hidden="true"
      />

      <button
        type="button"
        aria-expanded={open}
        onClick={handleToggle}
        className={cn(
          'flex w-full items-center gap-3.5 px-5 py-4 text-left',
          'outline-none transition-colors duration-150',
          'hover:bg-muted/40',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        {icon && (
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
              open ? 'bg-current/10' : 'bg-current/5',
            )}
          >
            {icon}
          </span>
        )}

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={cn(
              'truncate text-sm font-semibold tracking-tight transition-colors duration-150',
              open ? 'text-inherit' : 'text-inherit/80',
            )}
          >
            {summary?.props?.children}
          </span>
          {description && (
            <span className="truncate text-xs text-inherit/60">
              {description}
            </span>
          )}
        </span>

        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-200',
            open ? 'bg-current/10' : 'bg-current/5 group-hover:bg-current/10',
          )}
        >
          {summary?.props?.expandIcon || (
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-300 ease-out',
                open ? 'rotate-180 text-inherit' : 'text-inherit/60',
              )}
            />
          )}
        </span>
      </button>

      {/* Grid-rows trick animates height without measuring content */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div
            data-slot="accordion-content"
            className={cn(
              'border-t border-border/50 px-5 pb-5 pt-3.5 text-sm leading-relaxed text-inherit/70',
              icon && 'ml-[52px]',
              'transition-opacity duration-200',
              open ? 'opacity-100 delay-75' : 'opacity-0',
              details?.props?.className,
            )}
            style={details?.props?.style}
          >
            {details?.props?.children}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccordionSummary({
  children,
  expandIcon,
  icon,
  description,
  ...props
}) {
  return null;
}
AccordionSummary._accordionType = 'summary';

function AccordionDetails({ children, ...props }) {
  return null;
}
AccordionDetails._accordionType = 'details';

export { Accordion, AccordionSummary, AccordionDetails };
