import React, {
  useCallback,  useEffect,
  useRef, useState,
} from "react";
import { PlayerContext } from "./context";
import useControlGame from "@/hooks/useControlGame";
import { SONGS } from "../audio/songs";
import type { ErrorLevel } from "../interfaces/sound";
import type { PlayerState as PlayerStateType } from "../interfaces/context";

// SlideRef removed — using explicit songIndex/sectionIndex state

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // single-song model: only one song with two sections (no songIndex)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // single song instance
  const currentSong = SONGS[0];

  // --- error mapping: use control context to determine which variant to pick
  const { errorState, soundState, setErrorState, setSoundState } = useControlGame();
  // enforce rules: allow 0..2 error layers (0 = no error, 1 = minor, 2 = major)
  const userErrorLevel = Math.max(0, Math.min(2, Number(errorState))) as ErrorLevel;

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
  // loadFragment ahora acepta overrides opcionales para song/section
  const loadFragment = useCallback(async (opts?: { sectionIndex?: number }) => {
    const sectionIdx = typeof opts?.sectionIndex === 'number' ? opts.sectionIndex : currentSectionIndex;

    const song = SONGS[0]; // single song
    const section = song?.sections?.[sectionIdx];
    const frag = section?.variants?.[userErrorLevel];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleUrl = (frag as unknown as any)?.module;
    if (!frag || !moduleUrl) {
      console.error("loadFragment: fragment missing module url", { sectionIndex: sectionIdx });
      setDurationMs(0);
      audioRef.current = null;
      return () => {};
    }

    // pause and cleanup previous audio
    if (audioRef.current) {
      if (!audioRef.current.paused) audioRef.current.pause();
      // remove src to release resource
      audioRef.current.src = "";
      audioRef.current = null;
    }

    const audio = new Audio();
    audio.src = String(moduleUrl);
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

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
  }, [currentSectionIndex, userErrorLevel, attachAudioEvents, isMuted, volume]);

  const play = useCallback(async () => {
    if (!audioRef.current) await loadFragment();
    try { await audioRef.current?.play(); } catch { /* play rejected or no audio */ }
  }, [loadFragment]);

  // public goTo: navigates by section name and error level
  const goTo = useCallback(async (sectionName: import("../interfaces/control").SoundState, errorLevel: ErrorLevel) => {
    const map: Record<string, number> = { seccion1: 0, seccion2: 1 };
    const sectionIndex = map[sectionName] ?? 0;
    if (typeof setErrorState === 'function') setErrorState(errorLevel);
    if (typeof setSoundState === 'function') setSoundState(sectionName);
    const wasPlaying = isPlaying;
    setCurrentSectionIndex(sectionIndex);
    await loadFragment({ sectionIndex });
    if (wasPlaying) await play();
  }, [setErrorState, setSoundState, isPlaying, loadFragment, play]);

  const pause = useCallback(async () => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) await pause(); else await play();
  }, [isPlaying, pause, play]);

  const seek = useCallback(async (ms: number) => {
    const s = Math.max(0, ms / 1000);
    if (audioRef.current) {
      try { audioRef.current.currentTime = s; } catch { /* ignore invalid seek */ }
      setPositionMs(s * 1000);
    }
  }, []);

  // wrapper para cumplir la interfaz: ir a una sección por nombre de soundState
  // next/prev removed (not part of canonical PlayerState) — use goTo wrapper instead when needed

  const setVolume = useCallback((v: number) => {
    const vol = Math.max(0, Math.min(1, v));
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      if (isMuted) audioRef.current.muted = true;
    }
  }, [isMuted]);

  const mute = useCallback(() => {
    setIsMuted(true);
    if (audioRef.current) audioRef.current.muted = true;
  }, []);

  const unmute = useCallback(() => {
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    let cleanup: (() => void) | void;
    (async () => { cleanup = await loadFragment(); })();
    return () => {
      if (cleanup) cleanup();
      if (audioRef.current) audioRef.current.pause();
      if (audioRef.current) audioRef.current.src = "";
    };
  }, [loadFragment, currentSectionIndex, userErrorLevel]);

  const getPositionMs = useCallback(() => positionMs, [positionMs]);

  const value: PlayerStateType = {
  currentSong,
    currentSoundState: soundState,
    currentErrorLevel: userErrorLevel,
    isPlaying,
    durationMs,
    positionMs,
    volume,
    isMuted,
    totalSongs: SONGS.length,

    setErrorLevel: (l: ErrorLevel) => { if (typeof setErrorState === 'function') setErrorState(l); },
    getPositionMs,
    play,
    pause,
    togglePlay,
  goTo: goTo,
    setVolume,
    mute,
    unmute,
    setPositionMs: (ms: number) => { void seek(ms); },
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export default PlayerProvider;
