import { useState } from "react";
import type { ErrorState, SoundState } from "../interfaces/control";
import { ControlContext } from "./context";

export default function ControlContextProvider({children} : {children: React.ReactNode}) {

    const [soundState, setSoundState] = useState<SoundState>('starting');
    const [errorState, setErrorState] = useState<ErrorState>('none');

    return (
        <ControlContext.Provider value={{ soundState, setSoundState, errorState, setErrorState }}>
            {children}
        </ControlContext.Provider>
    );
}
