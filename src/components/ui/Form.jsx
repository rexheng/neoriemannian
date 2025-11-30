/**
 * @fileoverview Form components (Textarea, Select)
 * @module components/ui/Form
 */

import React, { memo, forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

/**
 * Textarea component with consistent styling
 */
const Textarea = memo(forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-zinc-800",
      "bg-zinc-950 px-3 py-2 text-sm ring-offset-background",
      "placeholder:text-zinc-400",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-colors duration-200",
      className
    )}
    {...props}
  />
)));

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  className: PropTypes.string,
};

/**
 * Custom Select component with dropdown
 */
const Select = memo(({ value, onValueChange, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      {React.Children.map(children, child => {
        if (child?.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen,
            value
          });
        }
        if (child?.type === SelectContent) {
          return isOpen ? React.cloneElement(child, {
            onSelect: (val) => {
              onValueChange(val);
              setIsOpen(false);
            }
          }) : null;
        }
        return child;
      })}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  value: PropTypes.string,
  onValueChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * Select trigger button
 */
const SelectTrigger = memo(({ children, onClick, isOpen, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-zinc-800",
      "bg-zinc-950 px-3 py-2 text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-colors duration-200 hover:bg-zinc-900",
      className
    )}
  >
    {children}
    <ChevronDown size={16} className={cn(
      "text-zinc-400 transition-transform duration-200",
      isOpen && "rotate-180"
    )} />
  </button>
));

SelectTrigger.displayName = 'SelectTrigger';

SelectTrigger.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  isOpen: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Select value display
 */
const SelectValue = memo(({ placeholder }) => (
  <span className="text-zinc-200">{placeholder}</span>
));

SelectValue.displayName = 'SelectValue';

SelectValue.propTypes = {
  placeholder: PropTypes.string,
};

/**
 * Select content dropdown
 */
const SelectContent = memo(({ children, onSelect, className }) => {
  // Recursively clone children to pass onSelect to all SelectItem components
  const cloneChildren = (children) => {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) return child;
      
      // If it's a SelectItem, pass onSelect
      if (child.type === SelectItem) {
        return React.cloneElement(child, { onSelect });
      }
      
      // If it has children, recursively process them
      if (child.props?.children) {
        return React.cloneElement(child, {
          children: cloneChildren(child.props.children)
        });
      }
      
      return child;
    });
  };

  return (
    <div className={cn(
      "absolute top-full left-0 right-0 mt-1 z-50",
      "bg-zinc-900 border border-zinc-800 rounded-md shadow-lg",
      "max-h-[300px] overflow-y-auto",
      "animate-in fade-in-0 zoom-in-95 duration-150",
      className
    )}>
      {cloneChildren(children)}
    </div>
  );
});

SelectContent.displayName = 'SelectContent';

SelectContent.propTypes = {
  children: PropTypes.node,
  onSelect: PropTypes.func,
  className: PropTypes.string,
};

/**
 * Select item option
 */
const SelectItem = memo(({ value, children, onSelect, className }) => (
  <button
    type="button"
    onClick={() => onSelect?.(value)}
    className={cn(
      "w-full px-3 py-2 text-sm text-left",
      "hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none",
      "transition-colors duration-100",
      className
    )}
  >
    {children}
  </button>
));

SelectItem.displayName = 'SelectItem';

SelectItem.propTypes = {
  value: PropTypes.string,
  children: PropTypes.node,
  onSelect: PropTypes.func,
  className: PropTypes.string,
};

/**
 * Horizontal separator
 */
const Separator = memo(({ className, orientation = 'horizontal' }) => (
  <div 
    className={cn(
      "shrink-0 bg-zinc-800",
      orientation === 'horizontal' ? "h-[1px] w-full my-4" : "h-full w-[1px] mx-4",
      className
    )} 
  />
));

Separator.displayName = 'Separator';

Separator.propTypes = {
  className: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
};

export { 
  Textarea, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem, 
  Separator 
};
