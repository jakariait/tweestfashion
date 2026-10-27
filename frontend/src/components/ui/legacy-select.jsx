import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

function Select({
  className,
  value,
  onChange,
  displayEmpty,
  renderValue,
  children,
  variant,
  size,
  label,
  fullWidth,
  ...props
}) {
  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      if (!child) return null;
      const childName = child.type?.displayName || child.type?.name;
      if (childName === 'MenuItem') {
        return (
          <option value={child.props.value} disabled={child.props.disabled}>
            {child.props.children}
          </option>
        );
      }
      return child;
    });
  };

  return (
    <select
      data-slot="legacy-select"
      value={value ?? ''}
      onChange={onChange}
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-base shadow-xs transition-[color,box-shadow] outline-none appearance-none bg-no-repeat',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-input/30',
        fullWidth && 'w-full',
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23666'%3e%3cpath d='M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e")`,
        backgroundPosition: `right 0.5rem center`,
        backgroundSize: `16px 12px`,
      }}
      {...props}
    >
      {renderChildren()}
    </select>
  );
}

export { Select };
