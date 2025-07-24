import { useBinding, useEffect, useMemo } from "@rbxts/react";
import { createMotion, MotionGoal } from "@rbxts/ripple";
import { FrameScheduler } from "../utilities";

export function useMotion<T extends MotionGoal>(initialValue: T) {
    const motion = useMemo(() => {
        return createMotion(initialValue);
    }, []);

    const [binding, setValue] = useBinding(initialValue);

    useEffect(
        () =>
            FrameScheduler.subscribe("Heartbeat", (deltaTime) => {
                const value = motion.step(deltaTime);

                if (value !== binding.getValue()) {
                    setValue(value);
                }
            }),
        [],
    );

    return $tuple(binding, motion);
}
