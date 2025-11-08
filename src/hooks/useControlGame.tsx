import { ControlContext } from "@/context/context";
import { useContext } from "react";

export default function useControlGame() {
    const controlContextData = useContext(ControlContext);

    if (!controlContextData) {
        return {} ;
    }

    return controlContextData;
}