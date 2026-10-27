import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

function Drawer({
  className,
  open,
  onClose,
  anchor = 'left',
  showCloseButton = false,
  children,
  ...props
}) {
  const sideMap = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => !v && onClose && onClose({}, 'backdropClick')}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          data-slot="drawer"
          className={cn(
            'fixed z-50 bg-background shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in',
            anchor === 'left' &&
              'left-0 top-0 h-full w-80 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
            anchor === 'right' &&
              'right-0 top-0 h-full w-80 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            anchor === 'top' &&
              'top-0 left-0 w-full h-64 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
            anchor === 'bottom' &&
              'bottom-0 left-0 w-full h-64 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
              <X className="size-4" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { Drawer };
