import { useMemo } from "react";
import useControlGame from "@/hooks/useControlGame";
import { usePlayer } from "@/hooks/usePlayer";
import CanvasGameSection from "@/components/GameOrq";
import { Application } from "@pixi/react";

export default function GamePage() {
    const control = useControlGame();
    const player = usePlayer();

    const duration = useMemo(() => Math.round((player.durationMs || 0) / 1000), [player.durationMs]);
    const position = Math.round((player.positionMs || 0) / 1000);

    const fmt = (s: number) => {
        const mm = Math.floor(s / 60).toString().padStart(2, "0");
        const ss = Math.floor(s % 60).toString().padStart(2, "0");
        return `${mm}:${ss}`;
    };

    return (
        <div style={{ padding: 16, maxWidth: 720 }}>
            <Application resizeTo={window}>
                <CanvasGameSection />
            </Application>

            {/* Small debug / controls summary */}
            <div style={{ marginTop: 12, fontSize: 14, color: "#222" }}>
                <div>Sección: {control.soundState} · Error: {control.errorState}</div>
                <div>
                    Tiempo: {fmt(position)} / {fmt(duration)}
                </div>
            </div>
        </div>
    );
}