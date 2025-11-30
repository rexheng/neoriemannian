/**
 * @fileoverview Custom hook for managing chord traversal history with undo/redo
 * @module hooks/useChordHistory
 */

import { useState, useCallback, useMemo } from 'react';
import { normalize, identifyChord, applyTransform, calculateTonnetzDelta } from '../utils/musicUtils';
import { INITIAL_CHORD, DEFAULT_VIEWBOX, TONNETZ_NODE_DISTANCE } from '../constants';

/**
 * Creates the initial history node
 * @returns {Object} Initial history state
 */
const createInitialState = () => ({
  notes: INITIAL_CHORD.notes,
  id: 'start',
  x: 0,
  y: 0,
  label: INITIAL_CHORD.label,
  op: 'Start',
  type: INITIAL_CHORD.type
});

/**
 * Custom hook for managing chord history with undo/redo capability
 * @returns {Object} History state and control functions
 */
export const useChordHistory = () => {
  // Current chord notes
  const [currentChord, setCurrentChord] = useState(INITIAL_CHORD.notes);
  
  // Full history of traversed chords
  const [history, setHistory] = useState([createInitialState()]);
  
  // Edges connecting nodes in visualization
  const [edges, setEdges] = useState([]);
  
  // Undo/redo stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  // SVG viewbox state
  const [viewBox, setViewBox] = useState(DEFAULT_VIEWBOX);

  /**
   * Current chord information (memoized for performance)
   */
  const chordInfo = useMemo(() => identifyChord(currentChord), [currentChord]);

  /**
   * Applies a transformation and updates history
   * @param {'P'|'L'|'R'} transformType - Type of transformation
   * @returns {Object|null} New node if created, null if self-mapping
   */
  const applyTransformation = useCallback((transformType) => {
    const result = applyTransform(currentChord, transformType);
    const newNotes = result.notes;
    const isSelfMap = result.isSelfMap;
    
    // If it's a self-mapping (symmetric chord like dim/aug with P), don't create a new node
    if (isSelfMap) {
      // Just return the current node info for audio playback
      return { 
        notes: currentChord, 
        isSelfMap: true,
        label: chordInfo.label,
        type: chordInfo.type
      };
    }
    
    const newInfo = identifyChord(newNotes);
    const prevNode = history[history.length - 1];

    // Calculate position for new node in Tonnetz
    const { dx, dy } = calculateTonnetzDelta(transformType, chordInfo.type, TONNETZ_NODE_DISTANCE);

    const newNode = {
      notes: normalize(newNotes),
      id: `${newInfo.label}-${Date.now()}`,
      label: newInfo.label,
      type: newInfo.type,
      x: prevNode.x + dx,
      y: prevNode.y + dy,
      op: transformType
    };

    const newEdge = { from: prevNode, to: newNode, type: transformType };

    // Save current state to undo stack
    setUndoStack(prev => [...prev, {
      chord: currentChord,
      history: [...history],
      edges: [...edges],
      viewBox: { ...viewBox }
    }]);
    
    // Clear redo stack on new action
    setRedoStack([]);

    // Update state
    setCurrentChord(normalize(newNotes));
    setHistory(prev => [...prev, newNode]);
    setEdges(prev => [...prev, newEdge]);
    setViewBox(prev => ({ 
      ...prev, 
      x: newNode.x - 150, 
      y: newNode.y - 150 
    }));

    return newNode;
  }, [currentChord, history, edges, viewBox, chordInfo]);

  /**
   * Undoes the last transformation
   */
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    
    // Save current state to redo stack
    setRedoStack(prev => [...prev, {
      chord: currentChord,
      history: [...history],
      edges: [...edges],
      viewBox: { ...viewBox }
    }]);

    // Restore previous state
    setCurrentChord(lastState.chord);
    setHistory(lastState.history);
    setEdges(lastState.edges);
    setViewBox(lastState.viewBox);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack, currentChord, history, edges, viewBox]);

  /**
   * Redoes the last undone transformation
   */
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    
    // Save current state to undo stack
    setUndoStack(prev => [...prev, {
      chord: currentChord,
      history: [...history],
      edges: [...edges],
      viewBox: { ...viewBox }
    }]);

    // Restore next state
    setCurrentChord(nextState.chord);
    setHistory(nextState.history);
    setEdges(nextState.edges);
    setViewBox(nextState.viewBox);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack, currentChord, history, edges, viewBox]);

  /**
   * Resets to initial state
   */
  const reset = useCallback(() => {
    setCurrentChord(INITIAL_CHORD.notes);
    setHistory([createInitialState()]);
    setEdges([]);
    setViewBox(DEFAULT_VIEWBOX);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  /**
   * Sets a specific chord directly (for preset loading)
   * @param {number[]} notes - Chord notes to set
   */
  const setChord = useCallback((notes) => {
    const normalizedNotes = normalize(notes);
    const info = identifyChord(normalizedNotes);
    
    const newNode = {
      notes: normalizedNotes,
      id: `${info.label}-${Date.now()}`,
      label: info.label,
      type: info.type,
      x: 0,
      y: 0,
      op: 'Set'
    };

    setCurrentChord(normalizedNotes);
    setHistory([newNode]);
    setEdges([]);
    setViewBox(DEFAULT_VIEWBOX);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  /**
   * Navigate to a specific node in the history (without removing nodes)
   * @param {Object} targetNode - The node to navigate to
   * @returns {Object|null} The target node if found
   */
  const goToNode = useCallback((targetNode) => {
    // Find the index of the target node in history
    const targetIndex = history.findIndex(node => node.id === targetNode.id);
    if (targetIndex === -1 || targetIndex === history.length - 1) {
      // Node not found or already at this node
      return null;
    }

    const node = history[targetIndex];

    // Just update the current chord and center view - don't modify history/edges
    setCurrentChord(node.notes);
    setViewBox(prev => ({
      ...prev,
      x: node.x - 150,
      y: node.y - 150
    }));

    return node;
  }, [history]);

  return {
    // State
    currentChord,
    chordInfo,
    history,
    edges,
    viewBox,
    
    // Capabilities
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    
    // Actions
    applyTransformation,
    undo,
    redo,
    reset,
    setChord,
    setViewBox,
    goToNode
  };
};

export default useChordHistory;
