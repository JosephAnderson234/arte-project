export type ErrorLevel = 0 | 1 | 2;

export type Fragment = { module: number };

export type Section = {
  id: "seccion1" | "seccion2" | "seccion3" | "seccion4"; 
  variants: Record<ErrorLevel, Fragment>;
};

export type Song = {
  id: `song${string}`;
  title: string;
  sections: Section[];
};
