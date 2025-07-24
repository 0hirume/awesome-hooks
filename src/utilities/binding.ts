import { Binding } from "@rbxts/react";

export function isBinding(value: unknown): value is Binding<unknown> {
    return (
        typeIs(value, "table") &&
        "getValue" in value &&
        typeIs(value.getValue, "function") &&
        "map" in value &&
        typeIs(value.map, "function")
    );
}

export function getBindingValue<T>(binding: T | Binding<T>): T {
    if (isBinding(binding)) {
        return binding.getValue();
    } else {
        return binding;
    }
}
