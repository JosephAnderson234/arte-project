import React, {
  createContext, useCallback, useContext, useEffect,
  useMemo, useRef, useState,
} from "react";
import { Audio } from "expo-av";
import { SONGS } from "./songs";
import type { Song, ErrorLevel } from "../interfaces/sound";
import { Platform } from "react-native";

type SlideRef = { songIndex: number; sectionIndex: number };

type PlayerState = {
  currentSong: Song;
  currentSectionId: "seccion1" | "seccion2" | "seccion3" | "seccion4";

  isPlaying: boolean;
  durationMs: number;

  getPositionMs: () => number;

  getAllSongs: () => Song[];

  goTo: (songIndex: number, sectionIndex: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
};

const PlayerContext = createContext<PlayerState | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userErrorLevel] = useState<ErrorLevel>(0);
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

  useEffect(() => { (async () => { await loadFragment(); })(); }, [currentSlide, loadFragment]);

  const getPositionMs = useCallback(() => positionMs, [positionMs]);
  const getAllSongs = useCallback(() => SONGS, []);

  const value: PlayerState = {
    currentSong,
    currentSectionId,
    isPlaying,
    durationMs,
    getPositionMs,
    getAllSongs,
    goTo,
    play,
    pause,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
