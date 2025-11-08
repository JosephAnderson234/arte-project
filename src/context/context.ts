import { createContext } from "react";import type { ControleContextType } from "../interfaces/context";

export const ControlContext = createContext<ControleContextType>({} as ControleContextType);