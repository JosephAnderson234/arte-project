import type { ErrorState, SoundState } from "./control";

export interface ControleContextType {
    soundState: SoundState;
    setSoundState: (state: SoundState) => void;
    errorState: ErrorState;
    setErrorState: (state: ErrorState) => void;

    //if we have to implement more, just edit this interface
}