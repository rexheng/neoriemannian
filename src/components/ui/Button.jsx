/**
 * @fileoverview Re-usable Button component with multiple variants
 * @module components/ui/Button
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

/**
 * Button variant styles
 */
const VARIANTS = {
  default: "bg-zinc-50 text-zinc-900 hover:bg-zinc-50/90",
  destructive: "bg-red-900 text-zinc-50 hover:bg-red-900/90",
  outline: "border border-zinc-800 bg-transparent hover:bg-zinc-800 hover:text-zinc-50",
  secondary: "bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80",
  ghost: "hover:bg-zinc-800 hover:text-zinc-50",
  link: "text-primary underline-offset-4 hover:underline",
  accent: "bg-emerald-600 text-zinc-50 hover:bg-emerald-600/90 shadow-sm",
};

/**
 * Button size styles
 */
const SIZES = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

/**
 * Reusable button component with multiple variants and sizes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {'default'|'destructive'|'outline'|'secondary'|'ghost'|'link'|'accent'} props.variant - Visual variant
 * @param {'default'|'sm'|'lg'|'icon'} props.size - Button size
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disabled state
 */
const Button = memo(({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className, 
  disabled,
  type = 'button',
  ...props 
}) => {
  const baseStyles = `
    inline-flex items-center justify-center whitespace-nowrap rounded-md 
    text-sm font-medium ring-offset-background transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
    focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
    active:scale-[0.98]
  `;

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={cn(baseStyles, VARIANTS[variant], SIZES[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'accent']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
