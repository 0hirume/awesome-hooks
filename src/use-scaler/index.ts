import { useBaseScaler } from "../internal/use-base-scaler";

export function useScaler() {
    return useBaseScaler((pixels, scale) => math.round((pixels * scale) / 4) * 4);
}
