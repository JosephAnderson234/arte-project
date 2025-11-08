import useControlGame from "@/hooks/useControlGame"
import { usePlayer } from "@/hooks/usePlayer";

export default function GamePage (){
    const {soundState } = useControlGame();
    const { goTo, play, currentSong } = usePlayer();
    //here we are going to implement the logic for the game



    return (
        <div>Game Page xd {currentSong.title}
        
        <button onClick={async () => {
            await goTo(0,0);
            await play();
        }}>Play</button>

        </div>
    )
}