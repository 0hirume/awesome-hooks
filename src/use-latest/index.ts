import { useMemo, useRef } from "@rbxts/react";
import { Predicate } from "../types";
import { isStrictEqual } from "../utilities";

export function useLatest<T>(value: T, predicate: Predicate<T> = isStrictEqual) {
    const ref = useRef(value);

    useMemo(() => {
        if (!predicate(ref.current, value)) {
            ref.current = value;
        }
    }, [value]);

    return ref;
}
