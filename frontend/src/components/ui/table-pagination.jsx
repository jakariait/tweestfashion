import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function TablePagination({
  className,
  count,
  page,
  rowsPerPage,
  onPageChange,
  component: Comp = 'div',
  ...props
}) {
  const totalPages = Math.ceil(count / rowsPerPage) || 1;

  return (
    <Comp
      data-slot="table-pagination"
      className={cn(
        'flex items-center justify-between px-4 py-3 border-t',
        className,
      )}
      {...props}
    >
      <span className="text-sm text-muted-foreground">
        {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, count)} of{' '}
        {count}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(null, page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(null, page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </Comp>
  );
}

export { TablePagination };
