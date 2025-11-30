/**
 * @fileoverview Music theory utilities for Neo-Riemannian transformations and negative harmony
 * @module utils/musicUtils
 */

import { NOTES, CHORD_DEFINITIONS, ENHARMONICS } from '../constants';

// ============================================================================
// BASIC MATH UTILITIES
// ============================================================================

/**
 * Modulo operation that handles negative numbers correctly
 * Essential for pitch class calculations in 12-tone system
 * @param {number} n - The number to apply modulo to
 * @param {number} [m=12] - The modulo base (12 for chromatic scale)
 * @returns {number} Result in range [0, m-1]
 * @example
 * mod(-1) // returns 11
 * mod(13) // returns 1
 */
export const mod = (n, m = 12) => ((n % m) + m) % m;

/**
 * Normalizes an array of notes to pitch classes in ascending order
 * @param {number[]} notes - Array of note values (can be any integers)
 * @returns {number[]} Sorted array of unique pitch classes [0-11]
 * @example
 * normalize([14, 4, 7]) // returns [2, 4, 7]
 */
export const normalize = (notes) => [...notes].map(n => mod(n)).sort((a, b) => a - b);

/**
 * Compares two arrays of notes for equality (pitch class equivalence)
 * @param {number[]} a - First array of notes
 * @param {number[]} b - Second array of notes
 * @returns {boolean} True if arrays contain same pitch classes
 */
export const arraysEqual = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

/**
 * Gets the note name label for a given pitch class
 * @param {number} n - Note value (any integer)
 * @returns {string} Note name (e.g., 'C', 'F#', 'Bb')
 */
export const getNoteLabel = (n) => NOTES[mod(n)];

// ============================================================================
// CHORD IDENTIFICATION
// ============================================================================

/**
 * Identifies a chord from an array of notes
 * Attempts to match against known chord definitions by trying each note as root
 * @param {number[]} notes - Array of note values
 * @returns {{root: number, type: string, label: string, name: string}} Chord information
 * @example
 * identifyChord([0, 4, 7]) // returns { root: 0, type: 'Major', label: 'C', name: 'Major' }
 * identifyChord([9, 0, 4]) // returns { root: 9, type: 'Minor', label: 'Am', name: 'Minor' }
 */
export const identifyChord = (notes) => {
  const sorted = normalize(notes);
  
  // Try each note as potential root
  for (let i = 0; i < sorted.length; i++) {
    const potentialRoot = sorted[i];
    const intervals = sorted.map(n => mod(n - potentialRoot)).sort((a, b) => a - b);
    
    const match = CHORD_DEFINITIONS.find(def => arraysEqual(def.intervals, intervals));
    
    if (match) {
      // Categorize chord type for visualization
      let type = 'Other';
      if (match.name === 'Major') type = 'Major';
      else if (match.name === 'Minor') type = 'Minor';
      else if (match.name === 'Diminished') type = 'Dim';
      else if (match.name === 'Augmented') type = 'Aug';
      else if (match.name.includes('Sus')) type = 'Sus';
      else if (match.name.includes('7') || match.name.includes('9')) type = 'Seventh';
      
      return { 
        root: potentialRoot, 
        type, 
        label: NOTES[potentialRoot] + match.suffix, 
        name: match.name 
      };
    }
  }
  
  // Fallback for unrecognized chords
  return { 
    root: sorted[0], 
    type: 'Unknown', 
    label: '?', 
    name: 'Unknown' 
  };
};

/**
 * Parses a chord string notation into an array of note values
 * Supports various formats: C, Cm, Cmaj7, C#m7, Dbdim, etc.
 * @param {string} str - Chord string (e.g., 'Cmaj7', 'F#m', 'Bbdim7')
 * @returns {number[]|null} Array of note values or null if parsing fails
 * @example
 * parseChordString('Cmaj7') // returns [0, 4, 7, 11]
 * parseChordString('Am') // returns [9, 0, 4] (normalized to [0, 4, 9])
 */
export const parseChordString = (str) => {
  const regex = /^([A-G][#b]?)(.*)$/i;
  const match = str.trim().match(regex);
  
  if (!match) return null;
  
  // Parse root note
  const rootName = match[1].charAt(0).toUpperCase() + (match[1].slice(1) || '');
  let root = NOTES.indexOf(rootName);
  
  // Check enharmonic equivalents if not found
  if (root === -1) {
    root = ENHARMONICS[rootName] !== undefined ? ENHARMONICS[rootName] : -1;
  }
  
  if (root === -1) return null;
  
  // Parse quality/type
  const quality = (match[2] || '').toLowerCase();
  
  // Find matching chord definition (sort by suffix length to match longest first)
  const def = [...CHORD_DEFINITIONS]
    .sort((a, b) => b.suffix.length - a.suffix.length)
    .find(d => {
      // Handle common aliases
      if (d.suffix === '' && (quality === '' || quality === 'maj' || quality === 'M')) return true;
      if (d.suffix === 'm' && (quality === 'min' || quality === '-')) return true;
      if (d.suffix === 'aug' && quality === '+') return true;
      if (d.suffix === 'dim' && quality === 'o') return true;
      return d.suffix.toLowerCase() === quality;
    });
  
  // Default to major triad if no match
  const intervals = def ? def.intervals : [0, 4, 7];
  
  return intervals.map(i => mod(root + i));
};

/**
 * Builds a chord from root and intervals
 * @param {number} root - Root note (0-11)
 * @param {number[]} intervals - Array of intervals from root
 * @returns {number[]} Array of note values
 */
export const buildChord = (root, intervals) => {
  return intervals.map(interval => mod(root + interval));
};

// ============================================================================
// NEGATIVE HARMONY
// ============================================================================

/**
 * Calculates the negative harmony equivalent of a single note
 * Reflects the note across the axis between the tonic and dominant
 * @param {number} note - The note to transform (0-11)
 * @param {number} [keyRoot=0] - The key center (tonic), default C
 * @returns {number} The reflected note (0-11)
 * @example
 * // In C major, the axis is between E and Eb (sum = 7)
 * getNegativeNote(0, 0) // C becomes G (7)
 * getNegativeNote(4, 0) // E becomes Eb (3)
 */
export const getNegativeNote = (note, keyRoot = 0) => {
  // Axis is between tonic and dominant (root and root+7)
  // The sum of a note and its reflection equals the axis sum
  const axisSum = keyRoot + mod(keyRoot + 7);
  return mod(axisSum - note);
};

/**
 * Transforms an entire chord using negative harmony
 * @param {number[]} chordNotes - Array of notes in the chord
 * @param {number} [keyRoot=0] - The key center (tonic)
 * @returns {number[]} Array of reflected notes
 * @example
 * getNegativeChord([0, 4, 7], 0) // C major becomes F minor [5, 8, 0]
 */
export const getNegativeChord = (chordNotes, keyRoot = 0) => {
  return chordNotes.map(n => getNegativeNote(n, keyRoot));
};

// ============================================================================
// NEO-RIEMANNIAN TRANSFORMATIONS (Generalized)
// ============================================================================

/**
 * Analyzes a trichord to extract its interval structure
 * For a trichord Q = {0, x, x+y} in prime form:
 * - x is the first interval (from root to second note)
 * - y is the second interval (from second note to third note)
 * 
 * @param {number[]} notes - Array of 3 chord notes
 * @returns {{root: number, x: number, y: number, type: string}} Interval structure
 */
const analyzeTrichord = (notes) => {
  if (notes.length !== 3) {
    // For non-trichords, fall back to basic analysis
    const info = identifyChord(notes);
    return { root: info.root, x: 4, y: 3, type: info.type }; // Default major intervals
  }
  
  const sorted = normalize(notes);
  
  // Try each note as root and find the most sensible interpretation
  // Priority: Major (4,3), Minor (3,4), Dim (3,3), Aug (4,4), Sus4 (5,2), Sus2 (2,5)
  const knownStructures = [
    { x: 4, y: 3, type: 'Major' },      // Major triad {0, 4, 7}
    { x: 3, y: 4, type: 'Minor' },      // Minor triad {0, 3, 7}
    { x: 3, y: 3, type: 'Dim' },        // Diminished {0, 3, 6}
    { x: 4, y: 4, type: 'Aug' },        // Augmented {0, 4, 8}
    { x: 5, y: 2, type: 'Sus4' },       // Sus4 {0, 5, 7}
    { x: 2, y: 5, type: 'Sus2' },       // Sus2 {0, 2, 7}
  ];
  
  for (let i = 0; i < sorted.length; i++) {
    const potentialRoot = sorted[i];
    const intervals = sorted.map(n => mod(n - potentialRoot)).sort((a, b) => a - b);
    
    // intervals is now [0, a, b] where a and b are intervals from root
    const x = intervals[1];           // First interval
    const y = intervals[2] - intervals[1];  // Second interval
    
    // Check against known structures
    const match = knownStructures.find(s => s.x === x && s.y === y);
    if (match) {
      return { root: potentialRoot, x, y, type: match.type };
    }
  }
  
  // Fallback: use first note as root
  const intervals = sorted.map(n => mod(n - sorted[0])).sort((a, b) => a - b);
  return { 
    root: sorted[0], 
    x: intervals[1], 
    y: intervals[2] - intervals[1],
    type: 'Unknown'
  };
};

/**
 * P (Parallel) Transformation - Generalized
 * 
 * For prime form trichord Q = {0, x, x+y}:
 * P = I_{x+y}^0 (Inversion around axis of 0 and x+y)
 * 
 * Effect: Maps x ↔ y, effectively swapping the interval structure
 * Result: {0, y, x+y}
 * 
 * For triads:
 * - Major {0,4,7} → Minor {0,3,7}: x=4,y=3 → x'=3,y'=4
 * - Minor {0,3,7} → Major {0,4,7}: x=3,y=4 → x'=4,y'=3
 * - Dim {0,3,6}: Symmetric, maps to itself
 * - Aug {0,4,8}: Symmetric, maps to itself
 * - Sus4 {0,5,7} ↔ Sus2 {0,2,7}: x=5,y=2 ↔ x=2,y=5
 * 
 * @param {number[]} notes - Array of chord notes
 * @returns {number[]} Transformed chord notes
 */
export const transformP = (notes) => {
  const { root, x, y, type } = analyzeTrichord(notes);
  
  // P swaps the intervals: {0, x, x+y} → {0, y, x+y}
  // The note at position x moves to position y
  return notes.map(n => {
    const interval = mod(n - root);
    if (interval === x) {
      return mod(root + y);  // x → y
    }
    return n;  // 0 and x+y stay fixed
  });
};

/**
 * L (Leading-Tone Exchange) Transformation - Generalized
 * 
 * For prime form trichord Q = {0, x, x+y}:
 * L = I_x^0 (Inversion around axis of 0 and x)
 * 
 * Effect: Maps x+y → -y (mod 12)
 * Result: {0, x, -y} = {0, x, 12-y}
 * 
 * For triads:
 * - Major {0,4,7}: x=4,y=3 → {0,4,9} but we move 0→-1 giving {11,4,7} = Em
 * - Minor {0,3,7}: x=3,y=4 → move 7→8 giving {0,3,8} = Ab
 * - Dim {0,3,6}: x=3,y=3 → {0,3,9} or move appropriately
 * - Aug {0,4,8}: x=4,y=4 → {0,4,0}... symmetric behavior
 * - Sus4 {0,5,7}: x=5,y=2 → move 0→-1 giving {11,5,7}
 * - Sus2 {0,2,7}: x=2,y=5 → move 7→8 giving {0,2,8}
 * 
 * @param {number[]} notes - Array of chord notes
 * @returns {number[]} Transformed chord notes
 */
export const transformL = (notes) => {
  const { root, x, y, type } = analyzeTrichord(notes);
  
  // L inverts around {0, x}, moving x+y to a new position
  // For Major-like (x > y): move root down by semitone
  // For Minor-like (x < y): move fifth up by semitone
  // For symmetric (x = y): move root down by semitone (convention)
  
  if (x >= y) {
    // Move root down by semitone: 0 → -1
    return notes.map(n => {
      const interval = mod(n - root);
      if (interval === 0) {
        return mod(n - 1);
      }
      return n;
    });
  } else {
    // Move the top note (x+y) up by semitone
    return notes.map(n => {
      const interval = mod(n - root);
      if (interval === mod(x + y)) {
        return mod(n + 1);
      }
      return n;
    });
  }
};

/**
 * R (Relative) Transformation - Generalized
 * 
 * For prime form trichord Q = {0, x, x+y}:
 * R = I_{x+y}^x (Inversion around axis of x and x+y)
 * 
 * Effect: Maps 0 → 2x+y
 * Result: {2x+y, x, x+y}
 * 
 * For triads:
 * - Major {0,4,7}: x=4,y=3 → 0→11, giving {9,4,7} or normalized {0,4,9} = Am
 * - Minor {0,3,7}: x=3,y=4 → 0→10, giving {10,3,7} = Eb
 * - Dim {0,3,6}: x=3,y=3 → 0→9, giving {9,3,6} = some chord
 * - Aug {0,4,8}: x=4,y=4 → 0→12=0, symmetric
 * - Sus4 {0,5,7}: x=5,y=2 → 0→12=0... 
 * - Sus2 {0,2,7}: x=2,y=5 → 0→9
 * 
 * @param {number[]} notes - Array of chord notes
 * @returns {number[]} Transformed chord notes
 */
export const transformR = (notes) => {
  const { root, x, y, type } = analyzeTrichord(notes);
  
  // R inverts around {x, x+y}, moving 0 to new position
  // For Major-like (x > y): move fifth up by whole tone
  // For Minor-like (x < y): move root down by whole tone
  // For symmetric: apply based on convention
  
  if (x >= y) {
    // Move the top note (x+y position) up by whole tone
    return notes.map(n => {
      const interval = mod(n - root);
      if (interval === mod(x + y)) {
        return mod(n + 2);
      }
      return n;
    });
  } else {
    // Move root down by whole tone: 0 → -2
    return notes.map(n => {
      const interval = mod(n - root);
      if (interval === 0) {
        return mod(n - 2);
      }
      return n;
    });
  }
};

/**
 * Applies a transformation by type string
 * @param {number[]} notes - Current chord notes
 * @param {'P'|'L'|'R'} type - Transformation type
 * @returns {number[]} Transformed chord notes
 */
export const applyTransform = (notes, type) => {
  switch (type) {
    case 'P': return transformP(notes);
    case 'L': return transformL(notes);
    case 'R': return transformR(notes);
    default: return notes;
  }
};

// ============================================================================
// AUDIO UTILITIES
// ============================================================================

/**
 * Calculates frequency for a given note and octave
 * Uses A4 = 440Hz as reference
 * @param {number} note - Note value (0-11)
 * @param {number} [octave=4] - Octave number
 * @returns {number} Frequency in Hz
 */
export const getNoteFrequency = (note, octave = 4) => {
  // A4 = 440Hz, note 9 in our system
  const A4 = 440;
  const semitonesFromA4 = (octave - 4) * 12 + (note - 9);
  return A4 * Math.pow(2, semitonesFromA4 / 12);
};

/**
 * Converts a chord to frequencies for playback
 * @param {number[]} notes - Array of note values
 * @param {number} [octave=4] - Base octave
 * @returns {number[]} Array of frequencies in Hz
 */
export const chordToFrequencies = (notes, octave = 4) => {
  return notes.map(note => getNoteFrequency(note, octave));
};

// ============================================================================
// TONNETZ POSITION CALCULATIONS
// ============================================================================

/**
 * Calculates the position delta for a transformation in the Tonnetz
 * Using proper geometric layout:
 * - P: moves vertically (0° for major going down, 180° for minor going up)
 * - R: moves 120° clockwise from vertical
 * - L: moves 240° clockwise from vertical (or 120° counter-clockwise)
 * 
 * @param {'P'|'L'|'R'} transformType - Type of transformation
 * @param {string} currentChordType - 'Major' or 'Minor'
 * @param {number} [distance=60] - Base distance between nodes
 * @returns {{dx: number, dy: number}} Position delta
 */
export const calculateTonnetzDelta = (transformType, currentChordType, distance = 60) => {
  const isMajor = currentChordType === 'Major';
  
  // Angles in radians (0 = up, clockwise positive)
  // P: 0° (up) for major→minor, 180° (down) for minor→major
  // R: 120° clockwise from up
  // L: 240° clockwise from up (or -120°)
  
  let angle;
  switch (transformType) {
    case 'P':
      // P moves vertically: major goes up (to minor), minor goes down (to major)
      angle = isMajor ? 0 : Math.PI;
      break;
    case 'R':
      // R: 120° clockwise from up for major, opposite for minor
      angle = isMajor ? (2 * Math.PI / 3) : (2 * Math.PI / 3 + Math.PI);
      break;
    case 'L':
      // L: 240° clockwise from up for major (or -120°), opposite for minor
      angle = isMajor ? (4 * Math.PI / 3) : (4 * Math.PI / 3 + Math.PI);
      break;
    default:
      return { dx: 0, dy: 0 };
  }
  
  // Convert angle to dx/dy (note: SVG y-axis is inverted, so -sin for y)
  const dx = distance * Math.sin(angle);
  const dy = -distance * Math.cos(angle);
  
  return { dx, dy };
};
