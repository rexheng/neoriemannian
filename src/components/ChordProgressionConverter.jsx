/**
 * @fileoverview Chord progression converter with negative harmony transformation
 * @module components/ChordProgressionConverter
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils/cn';
import { NOTES, PRESET_PROGRESSIONS, STRINGS } from '../constants';
import { parseChordString, getNegativeChord, identifyChord } from '../utils/musicUtils';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { Textarea, Select, SelectTrigger, SelectContent, SelectItem, Separator } from './ui/Form';
import { 
  RefreshCcw, 
  Calculator, 
  ArrowRight, 
  Play, 
  Square,
  Volume2,
  VolumeX
} from 'lucide-react';

/**
 * Key selector grid component
 */
const KeySelector = memo(({ selectedKey, onKeyChange }) => (
  <div>
    <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
      <Calculator size={14} /> {STRINGS.KEY_CENTER}
    </h3>
    <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5 sm:gap-2">
      {NOTES.map((note, i) => (
        <button
          key={note}
          onClick={() => onKeyChange(i)}
          className={cn(
            "h-10 sm:h-9 rounded-md text-xs font-bold border transition-all duration-200",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
            "active:scale-95",
            selectedKey === i
              ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          )}
        >
          {note}
        </button>
      ))}
    </div>
  </div>
));

KeySelector.displayName = 'KeySelector';

KeySelector.propTypes = {
  selectedKey: PropTypes.number.isRequired,
  onKeyChange: PropTypes.func.isRequired,
};

/**
 * Preset progression selector
 */
const PresetSelector = memo(({ onSelect, selectedPreset }) => {
  // Find the name of the selected preset for display
  const selectedName = useMemo(() => {
    if (!selectedPreset) return null;
    const preset = PRESET_PROGRESSIONS.find(p => p.chords === selectedPreset);
    return preset ? preset.name : null;
  }, [selectedPreset]);

  return (
    <Select 
      value={selectedPreset || ""}
      onValueChange={onSelect}
      className="w-full"
    >
      <SelectTrigger className="bg-zinc-900/50 border-zinc-800">
        <span className={selectedName ? "text-zinc-200" : "text-zinc-400"}>
          {selectedName || STRINGS.PRESET_SELECT}
        </span>
      </SelectTrigger>
      <SelectContent>
        {PRESET_PROGRESSIONS.map((preset, i) => (
          <SelectItem key={i} value={preset.chords}>
            <span className="font-medium">{preset.name}</span>
            <span className="text-zinc-500 ml-2">- {preset.description}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

PresetSelector.displayName = 'PresetSelector';

PresetSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  selectedPreset: PropTypes.string,
};

/**
 * Single chord conversion result display
 */
const ChordResult = memo(({ original, negLabel, isPlaying, onPlay }) => (
  <div className={cn(
    "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
    isPlaying 
      ? "border-emerald-500/50 bg-emerald-950/20" 
      : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900"
  )}>
    <div className="w-1/3">
      <span className="block text-[10px] text-zinc-500 uppercase font-semibold">In</span>
      <span className="font-bold text-zinc-300">{original}</span>
    </div>
    
    <ArrowRight size={14} className="text-zinc-700" />
    
    <div className="w-1/3 text-right">
      <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Out</span>
      <span className="font-bold text-emerald-400">{negLabel}</span>
    </div>
  </div>
));

ChordResult.displayName = 'ChordResult';

ChordResult.propTypes = {
  original: PropTypes.string.isRequired,
  negLabel: PropTypes.string.isRequired,
  isPlaying: PropTypes.bool,
  onPlay: PropTypes.func,
};

/**
 * Main Chord Progression Converter component
 */
const ChordProgressionConverter = memo(({ 
  keyRoot,
  onKeyChange,
  onPlayOriginal,
  onPlayNegative,
  isPlayingOriginal,
  isPlayingNegative,
  playingIndex,
  className 
}) => {
  const [progInput, setProgInput] = useState("Cmaj7 Am9 Dm7 G7");
  const [progOutput, setProgOutput] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  /**
   * Converts the input progression to negative harmony
   */
  const handleConvert = useCallback(() => {
    const chords = progInput.split(/[\s,]+/).filter(s => s.trim().length > 0);
    
    const result = chords.map(str => {
      const notes = parseChordString(str);
      if (!notes) {
        return { original: str, notes: [], negNotes: [], negLabel: '?' };
      }
      
      const negNotes = getNegativeChord(notes, keyRoot);
      const negInfo = identifyChord(negNotes);
      
      return { 
        original: str, 
        notes, 
        negNotes, 
        negLabel: negInfo.label 
      };
    });
    
    setProgOutput(result);
  }, [progInput, keyRoot]);

  /**
   * Handles preset selection
   */
  const handlePresetSelect = useCallback((preset) => {
    setProgInput(preset);
    setSelectedPreset(preset);
  }, []);

  /**
   * Compact output string (memoized)
   */
  const compactOutput = useMemo(() => 
    progOutput.map(r => r.negLabel).join("  "),
    [progOutput]
  );

  /**
   * Handles play original progression
   */
  const handlePlayOriginal = useCallback(() => {
    if (progOutput.length > 0) {
      const chords = progOutput.map(p => p.notes).filter(n => n.length > 0);
      onPlayOriginal?.(chords);
    }
  }, [progOutput, onPlayOriginal]);

  /**
   * Handles play negative progression
   */
  const handlePlayNegative = useCallback(() => {
    if (progOutput.length > 0) {
      const chords = progOutput.map(p => p.negNotes).filter(n => n.length > 0);
      onPlayNegative?.(chords);
    }
  }, [progOutput, onPlayNegative]);

  return (
    <div className={cn(
      "w-full md:w-[320px] lg:w-[380px] xl:w-[420px] bg-zinc-950 border-r border-zinc-800 p-4 sm:p-6 md:overflow-y-auto md:shrink-0",
      className
    )}>
      <div className="space-y-6 sm:space-y-8">
        {/* Key Selector */}
        <KeySelector selectedKey={keyRoot} onKeyChange={onKeyChange} />

        <Separator />

        {/* Progression Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              {STRINGS.PROGRESSION}
            </h3>
            <Badge variant="secondary" className="text-[10px] h-5">
              Ext. Chords Supported
            </Badge>
          </div>

          {/* Preset selector */}
          <PresetSelector onSelect={handlePresetSelect} selectedPreset={selectedPreset} />

          {/* Manual input */}
          <Textarea
            value={progInput}
            onChange={(e) => setProgInput(e.target.value)}
            placeholder={STRINGS.PLACEHOLDER_PROGRESSION}
            className="font-mono text-base bg-zinc-900/50 border-zinc-800 focus:border-emerald-500/50"
            rows={3}
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleConvert} 
              variant="accent" 
              className="flex-1 font-semibold shadow-emerald-900/20"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> 
              {STRINGS.CONVERT_PROGRESSION}
            </Button>
          </div>

          {/* Playback buttons */}
          {progOutput.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handlePlayOriginal}
                variant={isPlayingOriginal ? "destructive" : "secondary"}
                className="flex-1 h-11 sm:h-10"
                disabled={!onPlayOriginal}
              >
                {isPlayingOriginal ? <Square size={14} className="mr-2" /> : <Play size={14} className="mr-2" />}
                Original
              </Button>
              <Button
                onClick={handlePlayNegative}
                variant={isPlayingNegative ? "destructive" : "outline"}
                className="flex-1 h-11 sm:h-10 border-emerald-700 text-emerald-400 hover:bg-emerald-950/50"
                disabled={!onPlayNegative}
              >
                {isPlayingNegative ? <Square size={14} className="mr-2" /> : <Play size={14} className="mr-2" />}
                Negative
              </Button>
            </div>
          )}
        </div>

        {/* Output */}
        {progOutput.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Compact output card */}
            <Card className="bg-emerald-950/10 border-emerald-900/30">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  {STRINGS.COMPACT_OUTPUT}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="font-mono text-emerald-400 text-lg font-bold leading-relaxed break-words">
                  {compactOutput}
                </div>
              </CardContent>
            </Card>

            {/* Individual chord results */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {progOutput.map((item, i) => (
                <ChordResult
                  key={i}
                  original={item.original}
                  negLabel={item.negLabel}
                  isPlaying={playingIndex === i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ChordProgressionConverter.displayName = 'ChordProgressionConverter';

ChordProgressionConverter.propTypes = {
  keyRoot: PropTypes.number.isRequired,
  onKeyChange: PropTypes.func.isRequired,
  onPlayOriginal: PropTypes.func,
  onPlayNegative: PropTypes.func,
  isPlayingOriginal: PropTypes.bool,
  isPlayingNegative: PropTypes.bool,
  playingIndex: PropTypes.number,
  className: PropTypes.string,
};

export default ChordProgressionConverter;
