export type Predicate<T> = (previous: T | undefined, current: T) => boolean;
