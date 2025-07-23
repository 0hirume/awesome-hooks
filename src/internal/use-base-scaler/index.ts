import { useMemo } from "@rbxts/react";
import { useViewportSize } from "../../use-viewport-size";

const BASE_RESOLUTION = new Vector2(1280, 720);
const MIN_SCALE = 0.6;
const DOMINANT_AXIS = 0.5;

function calculateScaleFactor(viewport: Vector2): number {
    const width = math.log(viewport.X / BASE_RESOLUTION.X, 2);
    const height = math.log(viewport.Y / BASE_RESOLUTION.Y, 2);
    const blended = width + (height - width) * DOMINANT_AXIS;
    return math.max(2 ** blended, MIN_SCALE);
}

export function useBaseScaler(transform: (value: number, scale: number) => number) {
    const viewport = useViewportSize();

    return useMemo(
        () => (value: number) => transform(value, calculateScaleFactor(viewport)),
        [viewport],
    );
}
