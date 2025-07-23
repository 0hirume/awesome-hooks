import { useBaseScaler } from "../internal/use-base-scaler";

export function useTextScaler() {
    return useBaseScaler((pixels, scale) => math.floor(pixels * scale));
}
