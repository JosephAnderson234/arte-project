import type { ErrorState, SoundState } from "./control";
import type { Song } from "./sound";

export interface ControleContextType {
    soundState: SoundState;
    setSoundState: (state: SoundState) => void;
    errorState: ErrorState;
    setErrorState: (state: ErrorState) => void;

    //if we have to implement more, just edit this interface
}


export interface SlideRef { songIndex: number; sectionIndex: number };

export interface PlayerState {
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