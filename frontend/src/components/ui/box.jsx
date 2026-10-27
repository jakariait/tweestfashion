import { cn } from '@/lib/utils';

function Box({ className, ...props }) {
  return <div data-slot="box" className={cn(className)} {...props} />;
}

export { Box };
