/**
 * @fileoverview Main application component for Neo-Riemannian Explorer
 * A music theory visualization tool with Tonnetz and Negative Harmony modes
 * @module App
 */

import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Sigma } from 'lucide-react';

// UI Components
import { Tabs, TabsList, TabsTrigger } from './components/ui';

// Custom Hooks
import { useChordHistory, useKeyboardShortcuts, useAudio } from './hooks';

// Utils
import { getNegativeNote, normalize } from './utils/musicUtils';

// Constants
import { STRINGS } from './constants';

// Lazy load heavy components for better initial load
const TonnetzControls = lazy(() => import('./components/TonnetzControls'));
const TonnetzVisualiser = lazy(() => import('./components/TonnetzVisualiser'));
const ChordProgressionConverter = lazy(() => import('./components/ChordProgressionConverter'));
const NegativeHarmonyPiano = lazy(() => import('./components/NegativeHarmonyPiano'));

// Import styles
import './App.css';

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-zinc-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-zinc-500 text-sm">Loading...</span>
    </div>
  </div>
);

/**
 * Header component with mode switcher
 */
const Header = React.memo(({ mode, onModeChange }) => (
  <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/50 px-4 h-14 flex items-center justify-between z-50 sticky top-0">
    <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
      <Sigma className="text-emerald-500" size={20} />
      <span className="hidden sm:inline">{STRINGS.APP_TITLE}</span>
    </div>
    
    <Tabs value={mode} onValueChange={onModeChange} className="w-[240px] sm:w-[300px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tonnetz">{STRINGS.MODE_TONNETZ}</TabsTrigger>
        <TabsTrigger value="negative">{STRINGS.MODE_NEGATIVE}</TabsTrigger>
      </TabsList>
    </Tabs>
    
    <div className="w-6 md:w-20" /> {/* Spacer for centering */}
  </header>
));

Header.displayName = 'Header';

/**
 * Tonnetz Mode content
 */
const TonnetzMode = React.memo(({ 
  chordHistory, 
  audio 
}) => {
  const {
    currentChord,
    chordInfo,
    history,
    edges,
    viewBox,
    canUndo,
    canRedo,
    applyTransformation,
    undo,
    redo,
    reset,
    setChord
  } = chordHistory;

  const { playChord, isPlaying, stopAll } = audio;

  // Handle chord playback
  const handlePlayChord = useCallback(() => {
    if (isPlaying) {
      stopAll();
    } else {
      playChord(currentChord);
    }
  }, [isPlaying, playChord, stopAll, currentChord]);

  // Handle transformation with audio playback
  const handleTransform = useCallback((type) => {
    const newNode = applyTransformation(type);
    // Play the newly transformed chord
    if (newNode && newNode.notes) {
      playChord(newNode.notes);
    }
  }, [applyTransformation, playChord]);

  return (
    <div className="flex flex-1 flex-col md:flex-row w-full h-full min-h-0">
      <Suspense fallback={<LoadingFallback />}>
        <TonnetzControls
          chordInfo={chordInfo}
          currentChord={normalize(currentChord)}
          history={history}
          onTransform={handleTransform}
          onReset={reset}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onPlayChord={handlePlayChord}
          isPlaying={isPlaying}
          onSetChord={setChord}
        />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <TonnetzVisualiser
          history={history}
          edges={edges}
          viewBox={viewBox}
        />
      </Suspense>
    </div>
  );
});

TonnetzMode.displayName = 'TonnetzMode';

/**
 * Negative Harmony Mode content
 */
const NegativeHarmonyMode = React.memo(({ 
  negKey, 
  setNegKey, 
  melodyHistory, 
  onPianoClick,
  audio
}) => {
  const { playProgression, isPlaying, stopAll } = audio;
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [playingType, setPlayingType] = useState(null); // 'original' or 'negative'

  // Handle original progression playback
  const handlePlayOriginal = useCallback((chords) => {
    if (isPlaying && playingType === 'original') {
      stopAll();
      setPlayingIndex(-1);
      setPlayingType(null);
    } else {
      if (isPlaying) stopAll();
      setPlayingType('original');
      playProgression(chords, 100, (index) => {
        if (index === -1) {
          setPlayingType(null);
        }
        setPlayingIndex(index);
      });
    }
  }, [isPlaying, playingType, playProgression, stopAll]);

  // Handle negative progression playback
  const handlePlayNegative = useCallback((chords) => {
    if (isPlaying && playingType === 'negative') {
      stopAll();
      setPlayingIndex(-1);
      setPlayingType(null);
    } else {
      if (isPlaying) stopAll();
      setPlayingType('negative');
      playProgression(chords, 100, (index) => {
        if (index === -1) {
          setPlayingType(null);
        }
        setPlayingIndex(index);
      });
    }
  }, [isPlaying, playingType, playProgression, stopAll]);

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-full min-h-0">
      <Suspense fallback={<LoadingFallback />}>
        <ChordProgressionConverter
          keyRoot={negKey}
          onKeyChange={setNegKey}
          onPlayOriginal={handlePlayOriginal}
          onPlayNegative={handlePlayNegative}
          isPlayingOriginal={isPlaying && playingType === 'original'}
          isPlayingNegative={isPlaying && playingType === 'negative'}
          playingIndex={playingIndex}
        />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <NegativeHarmonyPiano
          keyRoot={negKey}
          melodyHistory={melodyHistory}
          onPianoClick={onPianoClick}
        />
      </Suspense>
    </div>
  );
});

NegativeHarmonyMode.displayName = 'NegativeHarmonyMode';

/**
 * Main App component
 */
const App = () => {
  // Mode state
  const [mode, setMode] = useState('tonnetz');
  
  // Negative Harmony state
  const [negKey, setNegKey] = useState(0);
  const [melodyHistory, setMelodyHistory] = useState([]);
  
  // Custom hooks
  const chordHistory = useChordHistory();
  const audio = useAudio({ volume: 0.3 });

  /**
   * Handles piano key click in negative harmony mode
   * Only plays the reflected (negative) note, not the input
   */
  const handlePianoClick = useCallback((note) => {
    const negNote = getNegativeNote(note, negKey);
    setMelodyHistory(prev => [...prev.slice(-9), { input: note, output: negNote }]);
    
    // Only play the negative/reflected note
    audio.playNote(negNote, 4, 0.5);
  }, [negKey, audio]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNotePlay: mode === 'negative' ? handlePianoClick : undefined,
    onUndo: mode === 'tonnetz' ? chordHistory.undo : undefined,
    onRedo: mode === 'tonnetz' ? chordHistory.redo : undefined,
    enabled: true
  });

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header mode={mode} onModeChange={setMode} />

      <main className="flex flex-1 overflow-hidden min-h-0">
        {mode === 'tonnetz' && (
          <TonnetzMode 
            chordHistory={chordHistory}
            audio={audio}
          />
        )}

        {mode === 'negative' && (
          <NegativeHarmonyMode
            negKey={negKey}
            setNegKey={setNegKey}
            melodyHistory={melodyHistory}
            onPianoClick={handlePianoClick}
            audio={audio}
          />
        )}
      </main>
    </div>
  );
};

export default App;
