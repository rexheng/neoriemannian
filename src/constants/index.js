/**
 * @fileoverview Musical constants and definitions for the Neo-Riemannian Explorer
 * @module constants
 */

// ============================================================================
// NOTE DEFINITIONS
// ============================================================================

/**
 * Array of all 12 chromatic notes using standard notation
 * Uses flats for Eb, Ab, Bb (common in jazz/classical)
 * @constant {string[]}
 */
export const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Piano keyboard key definitions for visual rendering
 * Includes octave extension (C to C)
 * @constant {Array<{note: number, type: 'white'|'black', label: string}>}
 */
export const KEYBOARD_KEYS = [
  { note: 0, type: 'white', label: 'C' },
  { note: 1, type: 'black', label: 'C#' },
  { note: 2, type: 'white', label: 'D' },
  { note: 3, type: 'black', label: 'Eb' },
  { note: 4, type: 'white', label: 'E' },
  { note: 5, type: 'white', label: 'F' },
  { note: 6, type: 'black', label: 'F#' },
  { note: 7, type: 'white', label: 'G' },
  { note: 8, type: 'black', label: 'Ab' },
  { note: 9, type: 'white', label: 'A' },
  { note: 10, type: 'black', label: 'Bb' },
  { note: 11, type: 'white', label: 'B' },
  { note: 12, type: 'white', label: 'C' },
];

/**
 * Enharmonic equivalents mapping for chord parsing
 * Maps alternative note names to their semitone values
 * @constant {Object<string, number>}
 */
export const ENHARMONICS = {
  'Db': 1, 'D#': 3, 'Eb': 3, 'Gb': 6, 'G#': 8, 
  'Ab': 8, 'A#': 10, 'Bb': 10, 'E#': 5, 'B#': 0, 
  'Cb': 11, 'Fb': 4
};

// ============================================================================
// CHORD DEFINITIONS
// ============================================================================

/**
 * Chord type definitions with intervals from root
 * Used for chord identification and construction
 * @constant {Array<{name: string, suffix: string, intervals: number[]}>}
 */
export const CHORD_DEFINITIONS = [
  { name: 'Major', suffix: '', intervals: [0, 4, 7] },
  { name: 'Minor', suffix: 'm', intervals: [0, 3, 7] },
  { name: 'Diminished', suffix: 'dim', intervals: [0, 3, 6] },
  { name: 'Augmented', suffix: 'aug', intervals: [0, 4, 8] },
  { name: 'Major 7', suffix: 'maj7', intervals: [0, 4, 7, 11] },
  { name: 'Minor 7', suffix: 'm7', intervals: [0, 3, 7, 10] },
  { name: 'Dominant 7', suffix: '7', intervals: [0, 4, 7, 10] },
  { name: 'Diminished 7', suffix: 'dim7', intervals: [0, 3, 6, 9] },
  { name: 'Half Dim 7', suffix: 'm7b5', intervals: [0, 3, 6, 10] },
  { name: 'Sus 4', suffix: 'sus4', intervals: [0, 5, 7] },
  { name: 'Sus 2', suffix: 'sus2', intervals: [0, 2, 7] },
  { name: 'Add 9', suffix: 'add9', intervals: [0, 2, 4, 7] },
  { name: 'Minor 9', suffix: 'm9', intervals: [0, 3, 7, 10, 14] },
  { name: 'Major 9', suffix: 'maj9', intervals: [0, 4, 7, 11, 14] },
  { name: 'Dominant 9', suffix: '9', intervals: [0, 4, 7, 10, 14] },
];

/**
 * Preset chord progressions for quick selection
 * @constant {Array<{name: string, chords: string, description: string}>}
 */
export const PRESET_PROGRESSIONS = [
  { name: 'ii-V-I (Jazz)', chords: 'Dm7 G7 Cmaj7', description: 'Classic jazz cadence' },
  { name: 'I-vi-IV-V (50s)', chords: 'C Am F G', description: '50s doo-wop progression' },
  { name: 'I-IV-V-I (Blues)', chords: 'C F G C', description: 'Basic blues structure' },
  { name: 'I-V-vi-IV (Pop)', chords: 'C G Am F', description: 'Modern pop standard' },
  { name: 'vi-IV-I-V (Emo)', chords: 'Am F C G', description: 'Emotional pop progression' },
  { name: 'ii-V-I-VI (Turnaround)', chords: 'Dm7 G7 Cmaj7 A7', description: 'Jazz turnaround' },
  { name: 'I-bVII-IV (Rock)', chords: 'C Bb F', description: 'Classic rock sound' },
  { name: 'Coltrane Changes', chords: 'Cmaj7 Eb7 Abmaj7 B7 Emaj7 G7', description: 'Giant Steps' },
];

// ============================================================================
// KEYBOARD MAPPING
// ============================================================================

/**
 * Computer keyboard to note mapping for playing
 * @constant {Object<string, number>}
 */
export const KEYBOARD_NOTE_MAP = {
  'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11
};

// ============================================================================
// AUDIO CONSTANTS
// ============================================================================

/**
 * Base frequencies for notes in octave 4 (A4 = 440Hz standard)
 * @constant {Object<string, number>}
 */
export const NOTE_FREQUENCIES = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'Ab': 415.30,
  'A': 440.00,
  'Bb': 466.16,
  'B': 493.88
};

/**
 * Default audio settings
 * @constant {Object}
 */
export const AUDIO_DEFAULTS = {
  volume: 0.3,
  attackTime: 0.02,
  decayTime: 0.1,
  sustainLevel: 0.3,
  releaseTime: 0.5,
  noteDuration: 0.8
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Tonnetz transformation distance in SVG units
 * @constant {number}
 */
export const TONNETZ_NODE_DISTANCE = 60;

/**
 * Default viewbox for Tonnetz SVG
 * @constant {Object}
 */
export const DEFAULT_VIEWBOX = { x: -150, y: -150, w: 300, h: 300 };

/**
 * Initial chord state
 * @constant {Object}
 */
export const INITIAL_CHORD = {
  notes: [0, 4, 7],
  label: 'C Major',
  type: 'Major'
};

/**
 * Chord type colours for visualisation
 * @constant {Object<string, {fill: string, stroke: string}>}
 */
export const CHORD_COLOURS = {
  Major: { fill: '#4f46e5', stroke: '#6366f1' },    // Indigo
  Minor: { fill: '#be123c', stroke: '#e11d48' },    // Rose
  Dim: { fill: '#854d0e', stroke: '#a16207' },      // Amber
  Aug: { fill: '#7c3aed', stroke: '#8b5cf6' },      // Violet
  Sus: { fill: '#0d9488', stroke: '#14b8a6' },      // Teal
  Seventh: { fill: '#0891b2', stroke: '#06b6d4' },  // Cyan
  Unknown: { fill: '#52525b', stroke: '#71717a' }   // Zinc
};

// ============================================================================
// STRING CONSTANTS (for i18n)
// ============================================================================

export const STRINGS = {
  APP_TITLE: "Rex's Neo-Riemannian Thing",
  MODE_TONNETZ: 'Transformations',
  MODE_NEGATIVE: 'Negative Harmony',
  CURRENT_CHORD: 'Current Chord',
  TRAVERSAL_PATH: 'Traversal Path',
  CLEAR: 'Clear',
  CONVERT_PROGRESSION: 'Convert Progression',
  COMPACT_OUTPUT: 'Compact Output',
  KEY_CENTER: 'Key Center (Axis)',
  PROGRESSION: 'Progression',
  MELODY_MIRROR: 'Melody Mirror',
  INPUT: 'Input',
  REFLECTION: 'Reflection',
  TRANSFORM_P: 'Parallel',
  TRANSFORM_L: 'Leading',
  TRANSFORM_R: 'Relative',
  PLAY: 'Play',
  STOP: 'Stop',
  UNDO: 'Undo',
  REDO: 'Redo',
  EXPORT: 'Export',
  PRESET_SELECT: 'Select Preset',
  PLACEHOLDER_PROGRESSION: 'e.g., Cmaj7 Am9 Dm7 G7',
  PLAY_NOTES_HINT: 'Play notes to visualize their negative reflection.',
  PAN_ZOOM_DISABLED: 'Pan & Zoom Disabled (Demo)',
};
