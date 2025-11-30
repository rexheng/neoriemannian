/**
 * @fileoverview Interactive piano component for negative harmony visualization
 * @module components/NegativeHarmonyPiano
 */

import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils/cn';
import { KEYBOARD_KEYS, NOTES, STRINGS } from '../constants';
import { mod, getNoteLabel, getNegativeNote } from '../utils/musicUtils';
import { Card, CardContent } from './ui/Card';
import Badge from './ui/Badge';
import { Separator } from './ui/Form';
import { Piano as PianoIcon } from 'lucide-react';

/**
 * Individual piano key component
 */
const PianoKey = memo(({ 
  keyData, 
  isInput, 
  isOutput, 
  onClick,
  isFirst,
  isLast 
}) => {
  const handleClick = useCallback(() => {
    onClick(keyData.note);
  }, [onClick, keyData.note]);

  const getKeyClasses = () => {
    const base = "relative rounded-b-md transition-all duration-100 cursor-pointer select-none touch-manipulation";
    
    const typeClasses = keyData.type === 'white'
      ? "w-8 sm:w-10 md:w-12 h-28 sm:h-32 md:h-40 -mx-[1px] sm:-mx-[2px] z-0 bg-zinc-100 border-b-4 border-zinc-300 hover:bg-zinc-200 active:bg-zinc-200 active:scale-y-[0.98]"
      : "w-5 sm:w-6 md:w-8 h-16 sm:h-20 md:h-24 -mx-[10px] sm:-mx-[12px] md:-mx-[16px] z-10 bg-zinc-900 border-b-4 border-black hover:bg-zinc-800 active:bg-zinc-800 active:scale-y-[0.98]";

    const stateClasses = cn(
      isInput && !isOutput && "!bg-blue-500 !border-blue-700 mt-1 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)] scale-[0.98]",
      isOutput && !isInput && "!bg-emerald-500 !border-emerald-700 mt-1 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)] scale-[0.98]",
      isOutput && isInput && "!bg-indigo-500 !border-indigo-700 mt-1 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)] scale-[0.98]"
    );

    const positionClasses = cn(
      isFirst && "rounded-bl-lg",
      isLast && "rounded-br-lg"
    );

    return cn(base, typeClasses, stateClasses, positionClasses);
  };

  return (
    <div
      onClick={handleClick}
      className={getKeyClasses()}
      role="button"
      aria-label={`Play ${keyData.label}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className={cn(
        "absolute bottom-3 left-0 right-0 text-center text-[10px] font-bold transition-opacity duration-200",
        keyData.type === 'white' && !isInput && !isOutput 
          ? 'text-zinc-400' 
          : 'text-white/90',
        (isInput || isOutput) && 'opacity-100',
        !isInput && !isOutput && keyData.type === 'black' && 'opacity-0'
      )}>
        {keyData.label}
      </div>
    </div>
  );
});

PianoKey.displayName = 'PianoKey';

PianoKey.propTypes = {
  keyData: PropTypes.shape({
    note: PropTypes.number,
    type: PropTypes.oneOf(['white', 'black']),
    label: PropTypes.string,
  }).isRequired,
  isInput: PropTypes.bool,
  isOutput: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
};

/**
 * Mirror display showing input/output note comparison
 */
const MirrorDisplay = memo(({ inputNote, outputNote }) => {
  const hasNotes = inputNote !== null;
  
  return (
    <Card className="bg-zinc-900/30 border-zinc-800">
      <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
        {/* Input display */}
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center",
            "text-4xl sm:text-5xl font-bold shadow-2xl transition-all duration-300 border-4",
            hasNotes 
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-105' 
              : 'bg-zinc-900 text-zinc-700 border-zinc-800'
          )}>
            {hasNotes ? getNoteLabel(inputNote) : '?'}
          </div>
          <span className="text-xs uppercase tracking-widest text-blue-500 font-bold">
            {STRINGS.INPUT}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-32 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent opacity-50" />
        <div className="block sm:hidden w-32 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50" />

        {/* Output display */}
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center",
            "text-4xl sm:text-5xl font-bold shadow-2xl transition-all duration-300 border-4",
            hasNotes 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-105' 
              : 'bg-zinc-900 text-zinc-700 border-zinc-800'
          )}>
            {hasNotes ? getNoteLabel(outputNote) : '?'}
          </div>
          <span className="text-xs uppercase tracking-widest text-emerald-500 font-bold">
            {STRINGS.REFLECTION}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

MirrorDisplay.displayName = 'MirrorDisplay';

MirrorDisplay.propTypes = {
  inputNote: PropTypes.number,
  outputNote: PropTypes.number,
};

/**
 * Main Negative Harmony Piano component
 */
const NegativeHarmonyPiano = memo(({ 
  keyRoot, 
  melodyHistory, 
  onPianoClick,
  className 
}) => {
  // Get last played notes
  const lastEntry = useMemo(() => 
    melodyHistory.length > 0 ? melodyHistory[melodyHistory.length - 1] : null,
    [melodyHistory]
  );

  // Determine which keys are highlighted
  const getKeyState = useCallback((note) => {
    if (!lastEntry) return { isInput: false, isOutput: false };
    
    return {
      isInput: mod(lastEntry.input) === mod(note),
      isOutput: mod(lastEntry.output) === mod(note)
    };
  }, [lastEntry]);

  return (
    <div className={cn(
      "flex-1 bg-zinc-950 p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden",
      className
    )}>
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
      
      <div className="max-w-3xl w-full space-y-6 sm:space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 flex items-center gap-3">
              <PianoIcon className="text-emerald-500" size={28} /> 
              {STRINGS.MELODY_MIRROR}
            </h2>
            <p className="text-zinc-500 mt-1 text-sm sm:text-base">
              {STRINGS.PLAY_NOTES_HINT}
            </p>
          </div>
          
          {/* Keyboard shortcuts hint */}
          <Badge 
            variant="outline" 
            className="hidden md:flex py-2 px-4 gap-4 bg-zinc-900/80 text-zinc-400 border-zinc-800 backdrop-blur"
          >
            <div className="flex items-center gap-1.5">
              <span className="bg-zinc-800 border border-zinc-700 rounded px-1.5 text-zinc-200 font-mono text-xs">
                Shift
              </span> 
              Octave
            </div>
            <Separator className="h-4 w-px my-0 bg-zinc-700" orientation="vertical" />
            <div className="flex items-center gap-1.5">
              <span className="bg-zinc-800 border border-zinc-700 rounded px-1.5 text-zinc-200 font-mono text-xs">
                ,
              </span> 
              #
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-zinc-800 border border-zinc-700 rounded px-1.5 text-zinc-200 font-mono text-xs">
                .
              </span> 
              b
            </div>
          </Badge>
        </div>

        {/* Mirror visualization */}
        <MirrorDisplay 
          inputNote={lastEntry?.input ?? null}
          outputNote={lastEntry?.output ?? null}
        />

        {/* Interactive Piano */}
        <div className="flex justify-center select-none pb-6 overflow-x-auto">
          <div className="flex">
            {KEYBOARD_KEYS.map((k, i) => {
              const { isInput, isOutput } = getKeyState(k.note);
              
              return (
                <PianoKey
                  key={i}
                  keyData={k}
                  isInput={isInput}
                  isOutput={isOutput}
                  onClick={onPianoClick}
                  isFirst={i === 0}
                  isLast={i === KEYBOARD_KEYS.length - 1}
                />
              );
            })}
          </div>
        </div>

        {/* History trail */}
        {melodyHistory.length > 1 && (
          <div className="flex justify-center gap-2 flex-wrap">
            {melodyHistory.slice(-8).map((entry, i) => (
              <div 
                key={i}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                  "bg-zinc-800/50 border border-zinc-700/50",
                  i === melodyHistory.slice(-8).length - 1 && "ring-1 ring-zinc-600"
                )}
              >
                <span className="text-blue-400">{getNoteLabel(entry.input)}</span>
                <span className="text-zinc-600">→</span>
                <span className="text-emerald-400">{getNoteLabel(entry.output)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

NegativeHarmonyPiano.displayName = 'NegativeHarmonyPiano';

NegativeHarmonyPiano.propTypes = {
  keyRoot: PropTypes.number.isRequired,
  melodyHistory: PropTypes.arrayOf(PropTypes.shape({
    input: PropTypes.number,
    output: PropTypes.number,
  })).isRequired,
  onPianoClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default NegativeHarmonyPiano;
