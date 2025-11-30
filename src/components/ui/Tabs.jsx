/**
 * @fileoverview Tabs component for mode switching
 * @module components/ui/Tabs
 */

import React, { memo, Children, cloneElement, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

/**
 * Tabs container component
 */
const Tabs = memo(({ value, onValueChange, children, className }) => (
  <div className={cn("w-full", className)}>
    {Children.map(children, child => 
      cloneElement(child, { selectedValue: value, onValueChange })
    )}
  </div>
));

Tabs.displayName = 'Tabs';

Tabs.propTypes = {
  value: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * Tabs list container
 */
const TabsList = memo(({ children, className, selectedValue, onValueChange }) => (
  <div className={cn(
    "inline-flex h-10 items-center justify-center rounded-md",
    "bg-zinc-800/50 p-1 text-zinc-400",
    className
  )}>
    {Children.map(children, child => 
      cloneElement(child, { selectedValue, onValueChange })
    )}
  </div>
));

TabsList.displayName = 'TabsList';

TabsList.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  selectedValue: PropTypes.string,
  onValueChange: PropTypes.func,
};

/**
 * Individual tab trigger button
 */
const TabsTrigger = memo(({ value, selectedValue, onValueChange, children, className }) => {
  const handleClick = useCallback(() => {
    onValueChange(value);
  }, [onValueChange, value]);

  const isSelected = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm",
        "px-3 py-1.5 text-sm font-medium ring-offset-background",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected 
          ? "bg-zinc-950 text-zinc-50 shadow-sm" 
          : "hover:bg-zinc-800 hover:text-zinc-100",
        className
      )}
    >
      {children}
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

TabsTrigger.propTypes = {
  value: PropTypes.string.isRequired,
  selectedValue: PropTypes.string,
  onValueChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * Tab content panel
 */
const TabsContent = memo(({ value, selectedValue, children, className }) => {
  if (value !== selectedValue) return null;
  
  return (
    <div 
      role="tabpanel"
      className={cn("animate-in fade-in-0 duration-200", className)}
    >
      {children}
    </div>
  );
});

TabsContent.displayName = 'TabsContent';

TabsContent.propTypes = {
  value: PropTypes.string.isRequired,
  selectedValue: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
