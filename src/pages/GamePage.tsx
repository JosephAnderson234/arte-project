import { useMemo, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { SONGS } from "@/audio/songs";
import type { ErrorLevel } from "../interfaces/sound";

export default function GamePage() {
  const player = usePlayer();

  const [localVolume, setLocalVolume] = useState<number>(player.volume ?? 1);

  const currentSong = SONGS[0];

  const duration = useMemo(() => Math.round((player.durationMs || 0) / 1000), [player.durationMs]);
  const position = Math.round((player.positionMs || 0) / 1000);

  const fmt = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const selectSection = async (sectionId: typeof currentSong.sections[number]["id"]) => {
    await player.goTo(sectionId, player.currentErrorLevel);
  };

  const selectError = async (level: ErrorLevel) => {
    await player.goTo(player.currentSoundState, level);
  };

  const onChangeVolume = (v: number) => {
    setLocalVolume(v);
    player.setVolume(v);
  };

  return (
    <div className="w-full" style={{ color: "#fff", padding: 12 }}>
      <div style={{ fontSize: 14 }}>
        <div>Sección: {player.currentSoundState} · Error: {player.currentErrorLevel}</div>
        <div>Tiempo: {fmt(position)} / {fmt(duration)}</div>
        <div>Canción: {currentSong.title}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Secciones:</strong>
        <div style={{ marginTop: 8 }}>
          {currentSong.sections.map((section) => (
            <button key={section.id} onClick={() => void selectSection(section.id)} style={{ marginRight: 8 }}>
              {section.id}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Errores (variante):</strong>
        <div style={{ marginTop: 8 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <button key={i} onClick={() => void selectError(i as ErrorLevel)} style={{ marginRight: 8 }}>
              {i}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => void player.togglePlay()}>
          {player.isPlaying ? "Pausar" : "Reproducir"}
        </button>
        <button onClick={() => { player.mute(); }} style={{ marginLeft: 8 }}>
          Silenciar
        </button>
        <button onClick={() => { player.unmute(); }} style={{ marginLeft: 8 }}>
          Activar sonido
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Volumen: </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={localVolume}
          onChange={(e) => onChangeVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
