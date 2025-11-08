import { useNavigate } from "react-router-dom";
import robotsSketch from "@/assets/images/ChatGPT Image 8 nov 2025, 02_18_20.png";

export default function WelcomePage (){
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full relative font-arcade">
            {/* Fullscreen background image (put your sketch at public/images/robots-sketch.jpg) */}
            <div
                className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(${robotsSketch})` }}
                aria-hidden
            />

            {/* Dark overlay to improve text contrast */}
            <div className="absolute inset-0 bg-black/50" aria-hidden />

            {/* Content centered on top of the image */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-amber-300 mb-8 font-arcade leading-relaxed press-start-2p-regular typewriter-animation" >
                        LOOP FAIL
                    </h1>

                    <div className="w-full flex justify-center">
                        <p className="text-lg md:text-xl text-gray-200 mb-10 font-arcade leading-relaxed press-start-2p-regular typewriter-animation">
                            CUANDO EL FRACASO SE VUELVE ARMONIA
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/play')}
                            className="bg-amber-400 hover:bg-amber-500 text-black font-arcade px-8 py-4 rounded-md shadow-lg transition text-lg press-start-2p-regular "
                        >
                            JUGAR
                        </button>

                    </div>
                </div>
            </div>
        </div>
    )
}