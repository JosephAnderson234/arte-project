import type { Song, Section, ErrorLevel } from "./type";

const frag = (file: string) => ({
  module: require(`../../assets/sounds/${file}`),
});


export const SONGS: Song[] = [
  {
    id: "song01",
    title: "Canción 1",
    sections: [
      {
        id: "seccion1",
        variants: {
          0: frag("seccion1_error0.mp3"),
          1: frag("seccion1_error1.mp3"),
          2: frag("seccion1_error2.mp3"),
        },
      },
      {
        id: "seccion2",
        variants: {
          0: frag("seccion2_error0.mp3"),
          1: frag("seccion2_error1.mp3"),
          2: frag("seccion2_error2.mp3"),
        },
      },
    ],
  },
];
