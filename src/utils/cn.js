/**
 * @fileoverview Utility function for combining CSS classes
 * @module utils/cn
 */

/**
 * Combines multiple class names, filtering out falsy values
 * Similar to clsx/classnames libraries
 * @param {...(string|boolean|undefined|null)} classes - Class names to combine
 * @returns {string} Combined class string
 * @example
 * cn('base', isActive && 'active', variant) // 'base active primary'
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');

export default cn;
