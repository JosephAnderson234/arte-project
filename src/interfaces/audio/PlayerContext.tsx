import React, {
  createContext, useCallback, useContext, useEffect,
  useMemo, useRef, useState,
} from "react";
import { Audio } from "expo-av";
import { SONGS } from "./songs";
import type { Song, ErrorLevel } from "./type";
import { Platform } from "react-native"; 

type SlideRef = { songIndex: number; sectionIndex: number };

type PlayerState = {
  currentSlide: number;
  slide: SlideRef;
  currentSong: Song;
  currentSectionId: "seccion1" | "seccion2" | "seccion3" | "seccion4";

  userErrorLevel: ErrorLevel;

  isPlaying: boolean;
  positionMs: number;
  durationMs: number;

  setUserErrorLevel: (lvl: ErrorLevel) => void;
  goTo: (songIndex: number, sectionIndex: number) => Promise<void>;
  nextSlide: () => Promise<void>;
  prevSlide: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  playCurrentFragment: () => Promise<void>;
};

const PlayerContext = createContext<PlayerState | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userErrorLevel, setUserErrorLevel] = useState<ErrorLevel>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const totalSlides = SONGS.length * 4;

  const slide = useMemo<SlideRef>(() => ({
    songIndex: Math.floor(currentSlide / 4),
    sectionIndex: currentSlide % 4,
  }), [currentSlide]);

  const currentSong = SONGS[slide.songIndex];
  const currentSection = currentSong.sections[slide.sectionIndex];
  const currentSectionId = currentSection.id;

  const loadFragment = useCallback(async () => {
    const frag = currentSection.variants[userErrorLevel];

    try { await soundRef.current?.unloadAsync(); } catch {}
    const { sound } = await Audio.Sound.createAsync(
      frag.module,
      {
        shouldPlay: false,
        progressUpdateIntervalMillis: 150,
      }
    );
    soundRef.current = sound;
    sound.setOnPlaybackStatusUpdate((s: any) => {
      if (!s?.isLoaded) return;
      setIsPlaying(!!s.isPlaying);
      setPositionMs(s.positionMillis ?? 0);
      setDurationMs(s.durationMillis ?? 0);

    });
  }, [currentSection, userErrorLevel]);

  const goTo = useCallback(async (songIndex: number, sectionIndex: number) => {
    const idx = songIndex * 4 + sectionIndex;
    if (idx < 0 || idx >= totalSlides) return;
    setCurrentSlide(idx);
    await loadFragment();
  }, [totalSlides, loadFragment]);

  const nextSlide = useCallback(async () => {
    const next = Math.min(currentSlide + 1, totalSlides - 1);
    setCurrentSlide(next);
    await loadFragment();
  }, [currentSlide, totalSlides, loadFragment]);

  const prevSlide = useCallback(async () => {
    const prev = Math.max(currentSlide - 1, 0);
    setCurrentSlide(prev);
    await loadFragment();
  }, [currentSlide, loadFragment]);

  const play = useCallback(async () => { await soundRef.current?.playAsync(); }, []);
  const pause = useCallback(async () => { await soundRef.current?.pauseAsync(); }, []);

  const playCurrentFragment = useCallback(async () => {
    if (!soundRef.current) await loadFragment();
    await soundRef.current?.playAsync();
  }, [loadFragment]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      }
      await loadFragment();
    })();
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  useEffect(() => { (async () => { await loadFragment(); })(); }, [userErrorLevel, currentSlide, loadFragment]);

  const value: PlayerState = {
    currentSlide,
    slide,
    currentSong,
    currentSectionId,
    userErrorLevel,
    isPlaying,
    positionMs,
    durationMs,
    setUserErrorLevel,
    goTo,
    nextSlide,
    prevSlide,
    play,
    pause,
    playCurrentFragment,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
