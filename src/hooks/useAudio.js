/**
 * @fileoverview Custom hook for Web Audio API chord/note playback
 * @module hooks/useAudio
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { getNoteFrequency } from '../utils/musicUtils';
import { AUDIO_DEFAULTS } from '../constants';

/**
 * Custom hook for audio playback using Web Audio API
 * @param {Object} options - Audio options
 * @param {number} options.volume - Master volume (0-1)
 * @returns {Object} Audio control functions and state
 */
export const useAudio = (options = {}) => {
  const { volume = AUDIO_DEFAULTS.volume } = options;
  
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const activeOscillatorsRef = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  /**
   * Initializes the audio context (lazy initialization)
   */
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        setIsSupported(false);
        return null;
      }

      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = volume;

      return audioContextRef.current;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      setIsSupported(false);
      return null;
    }
  }, [volume]);

  /**
   * Resumes audio context if suspended (needed due to browser autoplay policies)
   */
  const resumeAudio = useCallback(async () => {
    const ctx = initAudio();
    if (ctx?.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }, [initAudio]);

  /**
   * Plays a single note
   * @param {number} note - Note value (0-11)
   * @param {number} octave - Octave number
   * @param {number} duration - Duration in seconds
   * @returns {Function} Stop function for this note
   */
  const playNote = useCallback(async (note, octave = 4, duration = AUDIO_DEFAULTS.noteDuration) => {
    const ctx = await resumeAudio();
    if (!ctx) return () => {};

    const frequency = getNoteFrequency(note, octave);
    
    const oscillator = ctx.createOscillator();
    const noteGain = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // ADSR envelope
    const now = ctx.currentTime;
    const { attackTime, decayTime, sustainLevel, releaseTime } = AUDIO_DEFAULTS;
    
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + attackTime);
    noteGain.gain.linearRampToValueAtTime(sustainLevel * volume, now + attackTime + decayTime);
    noteGain.gain.setValueAtTime(sustainLevel * volume, now + duration - releaseTime);
    noteGain.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.connect(noteGain);
    noteGain.connect(gainNodeRef.current);
    
    oscillator.start(now);
    oscillator.stop(now + duration + 0.1);
    
    activeOscillatorsRef.current.push(oscillator);
    
    oscillator.onended = () => {
      activeOscillatorsRef.current = activeOscillatorsRef.current.filter(o => o !== oscillator);
      if (activeOscillatorsRef.current.length === 0) {
        setIsPlaying(false);
      }
    };

    return () => {
      try {
        oscillator.stop();
      } catch (e) {
        // Already stopped
      }
    };
  }, [resumeAudio, volume]);

  /**
   * Plays a chord (multiple notes simultaneously)
   * @param {number[]} notes - Array of note values
   * @param {number} octave - Base octave
   * @param {number} duration - Duration in seconds
   */
  const playChord = useCallback(async (notes, octave = 4, duration = AUDIO_DEFAULTS.noteDuration) => {
    setIsPlaying(true);
    
    const stopFunctions = await Promise.all(
      notes.map((note, i) => {
        // Spread notes across octaves if needed
        const noteOctave = octave + Math.floor(i / 4);
        return playNote(note, noteOctave, duration);
      })
    );

    return () => {
      stopFunctions.forEach(stop => stop());
      setIsPlaying(false);
    };
  }, [playNote]);

  /**
   * Plays a chord progression
   * @param {Array<number[]>} progression - Array of chord note arrays
   * @param {number} tempo - BPM
   * @param {Function} onChordChange - Callback when chord changes
   */
  const playProgression = useCallback(async (progression, tempo = 120, onChordChange) => {
    const ctx = await resumeAudio();
    if (!ctx) return () => {};

    setIsPlaying(true);
    
    const beatDuration = 60 / tempo;
    let currentIndex = 0;
    let timeoutId = null;
    let stopped = false;

    const playNext = async () => {
      if (stopped || currentIndex >= progression.length) {
        setIsPlaying(false);
        return;
      }

      const chord = progression[currentIndex];
      onChordChange?.(currentIndex, chord);
      await playChord(chord, 4, beatDuration * 0.9);
      
      currentIndex++;
      timeoutId = setTimeout(playNext, beatDuration * 1000);
    };

    playNext();

    return () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      stopAll();
    };
  }, [resumeAudio, playChord]);

  /**
   * Stops all currently playing notes
   */
  const stopAll = useCallback(() => {
    activeOscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    activeOscillatorsRef.current = [];
    setIsPlaying(false);
  }, []);

  /**
   * Sets the master volume
   * @param {number} newVolume - Volume level (0-1)
   */
  const setVolume = useCallback((newVolume) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAll]);

  return {
    playNote,
    playChord,
    playProgression,
    stopAll,
    setVolume,
    isPlaying,
    isSupported,
    initAudio: resumeAudio
  };
};

export default useAudio;
