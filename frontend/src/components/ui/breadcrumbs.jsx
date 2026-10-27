import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

function Breadcrumbs({ className, separator, children, ...props }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <nav
      data-slot="breadcrumbs"
      className={cn(
        'flex items-center gap-1 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    >
      {items.map((child, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && (
            <span className="mx-1">
              {separator || <ChevronRight className="size-4" />}
            </span>
          )}
          {child}
        </span>
      ))}
    </nav>
  );
}

export { Breadcrumbs };
