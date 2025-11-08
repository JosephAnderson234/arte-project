export type ErrorLevel = 0 | 1 | 2;

export type Fragment = { module: number };

export type Section = {
  // only two sections supported by the app
  id: "seccion1" | "seccion2";
  // variants for error layers: 0 = no error, 1 = minor, 2 = major
  variants: Record<ErrorLevel, Fragment>;
};

export type Song = {
  id: `song${string}`;
  title: string;
  sections: Section[];
};
