/**
 * @fileoverview Custom hook for keyboard shortcuts
 * @module hooks/useKeyboardShortcuts
 */

import { useEffect, useCallback, useRef } from 'react';
import { KEYBOARD_NOTE_MAP } from '../constants';
import { mod } from '../utils/musicUtils';

/**
 * Custom hook for handling keyboard shortcuts and note input
 * @param {Object} options - Hook options
 * @param {Function} options.onNotePlay - Callback when a note is played
 * @param {Function} options.onUndo - Callback for undo action
 * @param {Function} options.onRedo - Callback for redo action
 * @param {Function} options.onTransform - Callback for P/L/R transformations
 * @param {boolean} options.enabled - Whether shortcuts are active
 * @returns {Object} Keyboard state and handlers
 */
export const useKeyboardShortcuts = ({ 
  onNotePlay, 
  onUndo, 
  onRedo,
  onTransform,
  enabled = true 
}) => {
  const pressedKeysRef = useRef(new Set());

  /**
   * Handles keyboard note input with modifiers
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleNoteInput = useCallback((e) => {
    const key = e.key.toLowerCase();
    
    if (KEYBOARD_NOTE_MAP.hasOwnProperty(key)) {
      let note = KEYBOARD_NOTE_MAP[key];
      
      // Shift for octave up
      if (e.shiftKey) note += 12;
      
      // Comma/< for sharp
      if (pressedKeysRef.current.has(',') || pressedKeysRef.current.has('<')) {
        note += 1;
      }
      
      // Period/> for flat
      if (pressedKeysRef.current.has('.') || pressedKeysRef.current.has('>')) {
        note -= 1;
      }
      
      onNotePlay?.(mod(note));
    }
  }, [onNotePlay]);

  /**
   * Handles undo/redo shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleUndoRedo = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        onRedo?.();
      }
    }
  }, [onUndo, onRedo]);

  /**
   * Handles P/L/R transformation shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleTransform = useCallback((e) => {
    const key = e.key.toUpperCase();
    if (key === 'P' || key === 'L' || key === 'R') {
      e.preventDefault();
      onTransform?.(key);
    }
  }, [onTransform]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Skip if typing in input/textarea
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      
      pressedKeysRef.current.add(e.key);
      
      // Handle undo/redo first
      handleUndoRedo(e);
      
      // Handle P/L/R transformations
      handleTransform(e);
      
      // Handle note input
      handleNoteInput(e);
    };

    const handleKeyUp = (e) => {
      pressedKeysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, handleNoteInput, handleUndoRedo, handleTransform]);

  return {
    pressedKeys: pressedKeysRef.current
  };
};

export default useKeyboardShortcuts;
