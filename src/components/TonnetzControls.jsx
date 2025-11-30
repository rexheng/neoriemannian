/**
 * @fileoverview Tonnetz control panel with transformation buttons and history
 * @module components/TonnetzControls
 */

import React, { memo, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils/cn';
import { NOTES, STRINGS } from '../constants';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/Form';
import { 
  ArrowRight, 
  History, 
  Trash2, 
  Music, 
  Undo2, 
  Redo2,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';

/**
 * Starting chord options - organized by type
 */
const STARTING_CHORDS = [
  // Major triads
  { label: 'C', notes: [0, 4, 7], type: 'Major' },
  { label: 'D', notes: [2, 6, 9], type: 'Major' },
  { label: 'E', notes: [4, 8, 11], type: 'Major' },
  { label: 'F', notes: [5, 9, 0], type: 'Major' },
  { label: 'G', notes: [7, 11, 2], type: 'Major' },
  { label: 'A', notes: [9, 1, 4], type: 'Major' },
  { label: 'B', notes: [11, 3, 6], type: 'Major' },
  { label: 'Eb', notes: [3, 7, 10], type: 'Major' },
  { label: 'Ab', notes: [8, 0, 3], type: 'Major' },
  { label: 'Bb', notes: [10, 2, 5], type: 'Major' },
  // Minor triads
  { label: 'Cm', notes: [0, 3, 7], type: 'Minor' },
  { label: 'Dm', notes: [2, 5, 9], type: 'Minor' },
  { label: 'Em', notes: [4, 7, 11], type: 'Minor' },
  { label: 'Fm', notes: [5, 8, 0], type: 'Minor' },
  { label: 'Gm', notes: [7, 10, 2], type: 'Minor' },
  { label: 'Am', notes: [9, 0, 4], type: 'Minor' },
  { label: 'Bm', notes: [11, 2, 6], type: 'Minor' },
  // Diminished triads
  { label: 'Cdim', notes: [0, 3, 6], type: 'Dim' },
  { label: 'Ddim', notes: [2, 5, 8], type: 'Dim' },
  { label: 'Edim', notes: [4, 7, 10], type: 'Dim' },
  { label: 'Fdim', notes: [5, 8, 11], type: 'Dim' },
  { label: 'Gdim', notes: [7, 10, 1], type: 'Dim' },
  // Augmented triads
  { label: 'Caug', notes: [0, 4, 8], type: 'Aug' },
  { label: 'Daug', notes: [2, 6, 10], type: 'Aug' },
  { label: 'Eaug', notes: [4, 8, 0], type: 'Aug' },
  { label: 'Faug', notes: [5, 9, 1], type: 'Aug' },
  { label: 'Gaug', notes: [7, 11, 3], type: 'Aug' },
  // Sus4 chords
  { label: 'Csus4', notes: [0, 5, 7], type: 'Sus' },
  { label: 'Dsus4', notes: [2, 7, 9], type: 'Sus' },
  { label: 'Esus4', notes: [4, 9, 11], type: 'Sus' },
  { label: 'Fsus4', notes: [5, 10, 0], type: 'Sus' },
  { label: 'Gsus4', notes: [7, 0, 2], type: 'Sus' },
  { label: 'Asus4', notes: [9, 2, 4], type: 'Sus' },
  // Sus2 chords
  { label: 'Csus2', notes: [0, 2, 7], type: 'Sus' },
  { label: 'Dsus2', notes: [2, 4, 9], type: 'Sus' },
  { label: 'Esus2', notes: [4, 6, 11], type: 'Sus' },
  { label: 'Fsus2', notes: [5, 7, 0], type: 'Sus' },
  { label: 'Gsus2', notes: [7, 9, 2], type: 'Sus' },
  { label: 'Asus2', notes: [9, 11, 4], type: 'Sus' },
];

/**
 * Starting chord selector component
 */
const StartingChordSelector = memo(({ currentLabel, onSelect }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        Starting Chord
      </label>
      <Select value={currentLabel} onValueChange={(val) => {
        const chord = STARTING_CHORDS.find(c => c.label === val);
        if (chord) onSelect(chord.notes);
      }}>
        <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-700">
          <span className="text-zinc-200">{currentLabel || 'Select chord'}</span>
        </SelectTrigger>
        <SelectContent>
          <div className="grid grid-cols-4 gap-1 p-2">
            {STARTING_CHORDS.map((chord) => (
              <SelectItem 
                key={chord.label} 
                value={chord.label} 
                className={cn(
                  "text-center justify-center",
                  currentLabel === chord.label && "bg-zinc-700"
                )}
              >
                {chord.label}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
});

StartingChordSelector.displayName = 'StartingChordSelector';

StartingChordSelector.propTypes = {
  currentLabel: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

/**
 * Current chord display card
 */
const CurrentChordCard = memo(({ chordInfo, notes, onPlay, isPlaying }) => (
  <Card className="border-blue-900/30 bg-blue-950/10">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-blue-400 uppercase tracking-wider flex items-center gap-2">
        <Music size={14} /> {STRINGS.CURRENT_CHORD}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl font-bold text-zinc-50 tracking-tight">
          {chordInfo.label}
        </div>
        {onPlay && (
          <Button
            onClick={onPlay}
            variant={isPlaying ? "destructive" : "secondary"}
            size="icon"
            className="h-10 w-10"
          >
            {isPlaying ? <Square size={16} /> : <Play size={16} />}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {notes.map((note, i) => (
          <div
            key={i}
            className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center",
              "text-sm font-bold shadow-lg border border-blue-500/50",
              "ring-2 ring-blue-900/20 bg-blue-600",
              "transition-transform duration-200 hover:scale-110"
            )}
          >
            {NOTES[note]}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
));

CurrentChordCard.displayName = 'CurrentChordCard';

CurrentChordCard.propTypes = {
  chordInfo: PropTypes.shape({
    label: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  notes: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPlay: PropTypes.func,
  isPlaying: PropTypes.bool,
};

/**
 * Transformation button component
 */
const TransformButton = memo(({ type, label, color, onClick }) => {
  const colorClasses = {
    indigo: "hover:border-indigo-500/50 hover:bg-indigo-950/30 text-indigo-400",
    emerald: "hover:border-emerald-500/50 hover:bg-emerald-950/30 text-emerald-400",
    rose: "hover:border-rose-500/50 hover:bg-rose-950/30 text-rose-400",
  };

  return (
    <Button
      onClick={() => onClick(type)}
      variant="outline"
      className={cn(
        "h-20 sm:h-24 flex-col gap-2 transition-all duration-200",
        colorClasses[color]
      )}
    >
      <span className="text-2xl font-bold">{type}</span>
      <span className="text-[10px] text-zinc-500 uppercase">{label}</span>
    </Button>
  );
});

TransformButton.displayName = 'TransformButton';

TransformButton.propTypes = {
  type: PropTypes.oneOf(['P', 'L', 'R']).isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['indigo', 'emerald', 'rose']).isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * History/traversal path display
 */
const TraversalPath = memo(({ history, onClear }) => {
  const pathRef = useRef(null);

  // Auto-scroll to end when history changes
  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.scrollLeft = pathRef.current.scrollWidth;
    }
  }, [history]);

  return (
    <div className="flex-1 min-h-[120px] sm:min-h-[150px] flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-2">
          <History size={12} /> {STRINGS.TRAVERSAL_PATH}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-6 text-xs px-2 text-zinc-500 hover:text-red-400"
        >
          <Trash2 size={12} className="mr-1" /> {STRINGS.CLEAR}
        </Button>
      </div>

      <div
        ref={pathRef}
        className={cn(
          "flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4",
          "overflow-x-auto flex items-center gap-3",
          "scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        )}
      >
        {history.map((step, i) => (
          <React.Fragment key={step.id}>
            {i > 0 && (
              <div className="flex flex-col items-center min-w-[20px]">
                <span className="text-[9px] font-mono text-zinc-600 mb-0.5">
                  {step.op}
                </span>
                <ArrowRight size={12} className="text-zinc-700" />
              </div>
            )}
            <Badge
              variant={i === history.length - 1 ? "default" : "secondary"}
              className={cn(
                "flex flex-col items-center justify-center h-[50px] min-w-[60px] py-1 px-2",
                "transition-all duration-200",
                i === history.length - 1 
                  ? "ring-2 ring-zinc-500 ring-offset-2 ring-offset-zinc-950" 
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <span className="text-[10px] font-normal opacity-70">
                {step.type?.slice(0, 3)}
              </span>
              <span className="text-sm font-bold">
                {step.label?.split(' ')[0]}
              </span>
            </Badge>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

TraversalPath.displayName = 'TraversalPath';

TraversalPath.propTypes = {
  history: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string,
    op: PropTypes.string,
  })).isRequired,
  onClear: PropTypes.func.isRequired,
};

/**
 * Main Tonnetz Controls component
 */
const TonnetzControls = memo(({
  chordInfo,
  currentChord,
  history,
  onTransform,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPlayChord,
  isPlaying,
  onSetChord,
  className
}) => (
  <div className={cn(
    "w-full md:w-[320px] lg:w-[380px] xl:w-[420px] border-r border-zinc-800 bg-zinc-950",
    "p-4 lg:p-6 overflow-y-auto flex flex-col gap-4 lg:gap-5 z-20 shadow-xl",
    "min-h-0 md:h-full",
    className
  )}>
    {/* Starting chord selector */}
    {onSetChord && (
      <StartingChordSelector 
        currentLabel={chordInfo.label}
        onSelect={onSetChord}
      />
    )}

    {/* Current chord display */}
    <CurrentChordCard 
      chordInfo={chordInfo} 
      notes={currentChord}
      onPlay={onPlayChord}
      isPlaying={isPlaying}
    />

    {/* Undo/Redo/Reset buttons */}
    <div className="flex gap-2">
      <Button
        onClick={onUndo}
        disabled={!canUndo}
        variant="outline"
        size="sm"
        className="flex-1 h-9 bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800"
      >
        <Undo2 size={14} className="mr-1.5" /> {STRINGS.UNDO}
      </Button>
      <Button
        onClick={onRedo}
        disabled={!canRedo}
        variant="outline"
        size="sm"
        className="flex-1 h-9 bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800"
      >
        <Redo2 size={14} className="mr-1.5" /> {STRINGS.REDO}
      </Button>
      <Button
        onClick={onReset}
        variant="outline"
        size="sm"
        className="h-9 px-3 bg-zinc-900/50 border-zinc-700 hover:bg-red-950/30 hover:border-red-900/50 hover:text-red-400"
        title="Reset to original chord"
      >
        <RotateCcw size={14} />
      </Button>
    </div>

    {/* Transformation buttons */}
    <div className="grid grid-cols-3 gap-3">
      <TransformButton 
        type="P" 
        label={STRINGS.TRANSFORM_P} 
        color="indigo" 
        onClick={onTransform} 
      />
      <TransformButton 
        type="L" 
        label={STRINGS.TRANSFORM_L} 
        color="emerald" 
        onClick={onTransform} 
      />
      <TransformButton 
        type="R" 
        label={STRINGS.TRANSFORM_R} 
        color="rose" 
        onClick={onTransform} 
      />
    </div>

    {/* Traversal history */}
    <TraversalPath history={history} onClear={onReset} />
  </div>
));

TonnetzControls.displayName = 'TonnetzControls';

TonnetzControls.propTypes = {
  chordInfo: PropTypes.shape({
    label: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  currentChord: PropTypes.arrayOf(PropTypes.number).isRequired,
  history: PropTypes.array.isRequired,
  onTransform: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
  onPlayChord: PropTypes.func,
  isPlaying: PropTypes.bool,
  onSetChord: PropTypes.func,
  className: PropTypes.string,
};

export default TonnetzControls;
