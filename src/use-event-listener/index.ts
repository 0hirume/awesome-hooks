import { useEffect } from "@rbxts/react";
import { useLatest } from "../use-latest";

interface EventListenerOptions {
    readonly once?: boolean;
}

type EventLike<T extends Callback = Callback> =
    | { Connect(callback: T): ConnectionLike }
    | { connect(callback: T): ConnectionLike }
    | { subscribe(callback: T): ConnectionLike };

type ConnectionLike = { Disconnect(): void } | { disconnect(): void } | (() => void);

const connect = (event: EventLike, callback: Callback): ConnectionLike => {
    if (typeIs(event, "RBXScriptSignal")) {
        const connection = event.Connect((...args: unknown[]) => {
            if (connection.Connected) {
                return callback(...args);
            }
        });
        return connection;
    } else if ("Connect" in event) {
        return event.Connect(callback);
    } else if ("connect" in event) {
        return event.connect(callback);
    } else if ("subscribe" in event) {
        return event.subscribe(callback);
    } else {
        throw "Event-like object does not have a supported connect method.";
    }
};

const disconnect = (connection: ConnectionLike) => {
    if (typeIs(connection, "function")) {
        connection();
    } else if (typeIs(connection, "RBXScriptConnection") || "Disconnect" in connection) {
        connection.Disconnect();
    } else if ("disconnect" in connection) {
        connection.disconnect();
    } else {
        throw "Connection-like object does not have a supported disconnect method.";
    }
};

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

        const connection = connect(event, (...args: unknown[]) => {
            if (once) {
                disconnect(connection);
                canDisconnect = false;
            }
            listenerRef.current?.(...args);
        });

        return () => {
            if (canDisconnect) {
                disconnect(connection);
            }
        };
    }, [event, once, listener !== undefined]);
}
