import { useApplication, extend } from "@pixi/react";
import { Assets, Texture, Container, Sprite as PixiSpriteClass } from "pixi.js";
import { useRef, useState, useEffect } from "react";
import protaTexture from "@/assets/images/prota-removebg-preview.png";

// register pixi.js classes so we can use <pixiContainer> / <pixiSprite> JSX tags
extend({ Container, Sprite: PixiSpriteClass });

export default function Section1({ badKey, next }: { badKey: () => void; next: () => void }) {
    // useApplication may return the Application or an object containing it depending on version
    const {app} = useApplication();
    // try to normalize: some versions return { app } others return app directly

    // The Pixi.js `Sprite`
    const spriteRef = useRef<PixiSpriteClass | null>(null);
    const [texture, setTexture] = useState(Texture.EMPTY);


    // Preload the sprite if it hasn't been loaded yet
    useEffect(() => {
        if (texture === Texture.EMPTY) {
            Assets.load(protaTexture).then((result) => {
                setTexture(result as Texture);
            });
        }
    }, [texture]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!spriteRef.current) return;
            switch (event.key) {
                case "ArrowUp":
                    next();
                    break;
                default:
                    badKey();
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [badKey, next]);

    const screenWidth = app ? app?.screen?.width : window.innerWidth;
    const screenHeight = app ? app?.screen?.height : window.innerHeight;


    return (
        <pixiContainer>
            <pixiSprite

                ref={spriteRef}
                texture={texture}
                anchor={0.5}
                x={screenWidth / 2}
                y={screenHeight / 2}
            />
        </pixiContainer>
    );
}