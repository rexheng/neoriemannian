/**
 * @fileoverview Badge component for status indicators and labels
 * @module components/ui/Badge
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

/**
 * Badge variant styles
 */
const VARIANTS = {
  default: "border-transparent bg-zinc-50 text-zinc-900 hover:bg-zinc-50/80",
  secondary: "border-transparent bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80",
  outline: "text-zinc-50 border-zinc-700",
  destructive: "border-transparent bg-red-900 text-zinc-50 hover:bg-red-900/80",
  emerald: "border-transparent bg-emerald-900/30 text-emerald-400 border border-emerald-900",
  blue: "border-transparent bg-blue-900/30 text-blue-400 border border-blue-900",
  indigo: "border-transparent bg-indigo-900/30 text-indigo-400 border border-indigo-900",
  rose: "border-transparent bg-rose-900/30 text-rose-400 border border-rose-900",
};

/**
 * Badge component for displaying status or labels
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {'default'|'secondary'|'outline'|'destructive'|'emerald'|'blue'|'indigo'|'rose'} props.variant - Visual variant
 * @param {string} props.className - Additional CSS classes
 */
const Badge = memo(({ children, variant = 'default', className }) => (
  <div className={cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5",
    "text-xs font-semibold transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    VARIANTS[variant],
    className
  )}>
    {children}
  </div>
));

Badge.displayName = 'Badge';

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'secondary', 'outline', 'destructive', 'emerald', 'blue', 'indigo', 'rose']),
  className: PropTypes.string,
};

export default Badge;
