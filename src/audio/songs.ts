import type { Song } from "../interfaces/sound";

import seccion1_error0 from "@/assets/sounds/seccion1_error0.mp3";
import seccion1_error1 from "@/assets/sounds/seccion1_error1.mp3";
import seccion1_error2 from "@/assets/sounds/seccion1_error2.mp3";
import seccion2_error0 from "@/assets/sounds/seccion2_error0.mp3";
import seccion2_error1 from "@/assets/sounds/seccion2_error1.mp3";
import seccion2_error2 from "@/assets/sounds/seccion2_error2.mp3";

export const SONGS: Song[] = [
  {
    id: "song01",
    title: "Canción 1",
    sections: [
      {
        id: "seccion1",
        variants: {
          0: { module: seccion1_error0 as unknown as number },
          1: { module: seccion1_error1 as unknown as number },
          2: { module: seccion1_error2 as unknown as number },
        },
      },
      {
        id: "seccion2",
        variants: {
          0: { module: seccion2_error0 as unknown as number },
          1: { module: seccion2_error1 as unknown as number },
          2: { module: seccion2_error2 as unknown as number },
        },
      },
    ],
  },
];
