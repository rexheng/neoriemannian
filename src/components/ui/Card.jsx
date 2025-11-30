/**
 * @fileoverview Card component and subcomponents for content containers
 * @module components/ui/Card
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

/**
 * Main card container component
 */
const Card = memo(({ className, children }) => (
  <div className={cn(
    "rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-50",
    "shadow-sm backdrop-blur-xl transition-all duration-200",
    "hover:border-zinc-700/50",
    className
  )}>
    {children}
  </div>
));

Card.displayName = 'Card';

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Card header section
 */
const CardHeader = memo(({ className, children }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Card title component
 */
const CardTitle = memo(({ className, children }) => (
  <h3 className={cn(
    "text-2xl font-semibold leading-none tracking-tight",
    className
  )}>
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Card description/subtitle
 */
const CardDescription = memo(({ className, children }) => (
  <p className={cn("text-sm text-zinc-400", className)}>
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Card content area
 */
const CardContent = memo(({ className, children }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Card footer section
 */
const CardFooter = memo(({ className, children }) => (
  <div className={cn("flex items-center p-6 pt-0", className)}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
