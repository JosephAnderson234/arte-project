import React, {
  useCallback,  useEffect,
  useMemo, useRef, useState,
} from "react";
import { PlayerContext } from "./context";
import { SONGS } from "../audio/songs";
import type { Song, ErrorLevel } from "../interfaces/sound";

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

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userErrorLevel] = useState<ErrorLevel>(0); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSlides = SONGS.length * 4;

  const slide = useMemo<SlideRef>(() => ({
    songIndex: Math.floor(currentSlide / 4),
    sectionIndex: currentSlide % 4,
  }), [currentSlide]);

  const currentSong = SONGS[slide.songIndex];
  const currentSection = currentSong.sections[slide.sectionIndex];
  const currentSectionId = currentSection.id;

  const attachAudioEvents = useCallback((audio: HTMLAudioElement) => {
    const onTime = () => {
      setPositionMs((audio.currentTime || 0) * 1000);
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDurationMs(d * 1000);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const loadFragment = useCallback(async () => {
    const frag = currentSection.variants[userErrorLevel];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleUrl = (frag as unknown as any).module;
    if (!frag || !moduleUrl) {
      console.error("loadFragment: fragment missing module url", { songIndex: slide.songIndex, sectionIndex: slide.sectionIndex });
      setDurationMs(0);
      audioRef.current = null;
      return () => {};
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

  const audio = new Audio();
  audio.src = String(moduleUrl);
    audio.preload = "auto";         
    audio.crossOrigin = "anonymous";

    const detach = attachAudioEvents(audio);
    audioRef.current = audio;

    const onLoaded = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDurationMs(d * 1000);
    };
    audio.addEventListener("loadedmetadata", onLoaded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      detach();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, userErrorLevel, attachAudioEvents]);

  const goTo = useCallback(async (songIndex: number, sectionIndex: number) => {
    const idx = songIndex * 4 + sectionIndex;
    if (idx < 0 || idx >= totalSlides) return;
    setCurrentSlide(idx);
    await loadFragment();
  }, [totalSlides, loadFragment]);

  const play = useCallback(async () => {
    if (!audioRef.current) await loadFragment();
    await audioRef.current?.play();
  }, [loadFragment]);

  const pause = useCallback(async () => {
    audioRef.current?.pause();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | void;
    (async () => { cleanup = await loadFragment(); })();
    return () => {
      if (cleanup) cleanup();
      audioRef.current?.pause();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      audioRef.current && (audioRef.current.src = "");
    };
  }, [loadFragment]);

  useEffect(() => {
    (async () => { await loadFragment(); })();
  }, [currentSlide, loadFragment]);

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

export default PlayerProvider;
