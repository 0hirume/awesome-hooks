import { useEffect } from "@rbxts/react";
import { EventLike } from "../types";
import { useLatest } from "../use-latest";
import { connectToEvent, disconnectFromEvent } from "../utilities/connection";

interface EventListenerOptions {
    readonly once?: boolean;
}

export function useEventListener<T extends EventLike>(
    event?: T,
    listener?: T extends EventLike<infer U> ? U : never,
    options: EventListenerOptions = {},
) {
    const { once = false } = options;

    const listenerRef = useLatest(listener);

    useEffect(() => {
        if (!event || !listener) {
            return;
        }

        let canDisconnect = true;

        const connection = connectToEvent(event, (...args: unknown[]) => {
            if (once) {
                disconnectFromEvent(connection);
                canDisconnect = false;
            }
            listenerRef.current?.(...args);
        });

        return () => {
            if (canDisconnect) {
                disconnectFromEvent(connection);
            }
        };
    }, [event, once, listener !== undefined]);
}
