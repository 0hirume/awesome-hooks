import { ConnectionLike, EventLike } from "../types";

export function connectToEvent(event: EventLike, callback: Callback): ConnectionLike {
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
        error("Event-like object does not have a supported connect method.");
    }
}

export function disconnectFromEvent(connection: ConnectionLike): void {
    if (typeIs(connection, "function")) {
        connection();
    } else if (typeIs(connection, "RBXScriptConnection") || "Disconnect" in connection) {
        connection.Disconnect();
    } else if ("disconnect" in connection) {
        connection.disconnect();
    } else {
        error("Connection-like object does not have a supported disconnect method.");
    }
}
