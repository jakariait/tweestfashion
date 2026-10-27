import { cn } from '@/lib/utils';

function DialogActions({ className, children, ...props }) {
  return (
    <div
      data-slot="dialog-actions"
      className={cn('flex items-center justify-end gap-2 px-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { DialogActions };
