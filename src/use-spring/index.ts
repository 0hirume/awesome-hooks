import { Binding, useEffect, useRef } from "@rbxts/react";
import { MotionGoal, SpringOptions } from "@rbxts/ripple";
import { useMotion } from "../use-motion";
import { FrameScheduler, getBindingValue } from "../utilities";

export function useSpring<T extends MotionGoal>(
    goal: T | Binding<T>,
    options?: SpringOptions,
): Binding<T>;
export function useSpring(goal: MotionGoal | Binding<MotionGoal>, options?: SpringOptions) {
    const [binding, motion] = useMotion(getBindingValue(goal));
    const previousValue = useRef(getBindingValue(goal));

    useEffect(
        () =>
            FrameScheduler.subscribe("Heartbeat", () => {
                const currentValue = getBindingValue(goal);

                if (currentValue !== previousValue.current) {
                    previousValue.current = currentValue;
                    motion.spring(currentValue, options);
                }
            }),
        [goal, options],
    );

    return binding;
}
