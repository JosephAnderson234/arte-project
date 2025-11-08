import type { ErrorLevel } from "@/interfaces/sound";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Audio } from "expo-av";
import { SONGS } from "@/audio/songs";
import type { PlayerState, SlideRef } from "@/interfaces/context";
import { Platform } from "react-native";
import { PlayerContext } from "./context";


export default function PlayerProvider ({ children }: { children: React.ReactNode }) {
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

		try { await soundRef.current?.unloadAsync(); } catch {
            console.error("Error unloading previous sound");
        }
		const { sound } = await Audio.Sound.createAsync(
			frag.module,
			{
				shouldPlay: false,
				progressUpdateIntervalMillis: 150,
			}
		);
		soundRef.current = sound;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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