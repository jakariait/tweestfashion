import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';

const iconMap = {
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
  success: CheckCircle2,
};

const colorMap = {
  error: 'bg-destructive/15 text-destructive border-destructive/30',
  warning:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
  success:
    'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800',
};

function Alert({
  className,
  severity = 'info',
  variant = 'standard',
  onClose,
  children,
  ...props
}) {
  const Icon = iconMap[severity] || iconMap.info;

  return (
    <div
      data-slot="alert"
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4 text-sm',
        colorMap[severity],
        variant === 'filled' && 'bg-foreground text-background',
        className,
      )}
      role="alert"
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={(e) => onClose(e)}
          className="shrink-0 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export { Alert };
