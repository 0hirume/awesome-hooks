export type Predicate<T> = (previous: T | undefined, current: T) => boolean;

export type EventLike<T extends Callback = Callback> =
    | { Connect(callback: T): ConnectionLike }
    | { connect(callback: T): ConnectionLike }
    | { subscribe(callback: T): ConnectionLike };

export type ConnectionLike = { Disconnect(): void } | { disconnect(): void } | (() => void);
