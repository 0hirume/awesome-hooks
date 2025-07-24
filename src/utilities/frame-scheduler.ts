import { RunService } from "@rbxts/services";

type FrameEvent = "Heartbeat" | "PreSimulation" | "PreRender";

interface CallbackEntry {
    callback: (deltaTime: number) => void;
    id: string;
}

export class FrameScheduler {
    private static readonly heartbeatCallbacks = new Map<string, CallbackEntry>();
    private static readonly preSimulationCallbacks = new Map<string, CallbackEntry>();
    private static readonly preRenderCallbacks = new Map<string, CallbackEntry>();

    private static heartbeatConnection?: RBXScriptConnection;
    private static preSimulationConnection?: RBXScriptConnection;
    private static preRenderConnection?: RBXScriptConnection;

    private static inactiveThread?: thread;
    private static callbackCounter = 0;

    static subscribe(event: FrameEvent, callback: (deltaTime: number) => void): () => void {
        const id = `FrameScheduler/${event}/${++this.callbackCounter}`;
        const entry: CallbackEntry = { callback, id };

        switch (event) {
            case "Heartbeat":
                this.heartbeatCallbacks.set(id, entry);
                this.ensureHeartbeatConnection();
                return () => this.unsubscribeHeartbeat(id);

            case "PreSimulation":
                this.preSimulationCallbacks.set(id, entry);
                this.ensurePreSimulationConnection();
                return () => this.unsubscribePreSimulation(id);

            case "PreRender":
                if (!RunService.IsClient()) {
                    return () => {};
                }
                this.preRenderCallbacks.set(id, entry);
                this.ensurePreRenderConnection();
                return () => this.unsubscribePreRender(id);

            default:
                error(`Unsupported frame event: ${event}`);
        }
    }

    static getListenerCount(event: FrameEvent): number {
        switch (event) {
            case "Heartbeat":
                return this.heartbeatCallbacks.size();
            case "PreSimulation":
                return this.preSimulationCallbacks.size();
            case "PreRender":
                return this.preRenderCallbacks.size();
            default:
                return 0;
        }
    }

    static isActive(event: FrameEvent): boolean {
        return this.getListenerCount(event) > 0;
    }

    static cleanup(): void {
        this.heartbeatCallbacks.clear();
        this.preSimulationCallbacks.clear();
        this.preRenderCallbacks.clear();

        this.disconnectAll();
    }

    private static disconnectAll(): void {
        this.heartbeatConnection?.Disconnect();
        this.preSimulationConnection?.Disconnect();
        this.preRenderConnection?.Disconnect();

        this.heartbeatConnection = undefined;
        this.preSimulationConnection = undefined;
        this.preRenderConnection = undefined;
    }

    private static ensureHeartbeatConnection(): void {
        if (this.heartbeatConnection !== undefined) {
            return;
        }

        this.heartbeatConnection = RunService.Heartbeat.Connect((deltaTime) => {
            this.executeCallbacks(this.heartbeatCallbacks, deltaTime);
        });
    }

    private static ensurePreSimulationConnection(): void {
        if (this.preSimulationConnection !== undefined) {
            return;
        }

        this.preSimulationConnection = RunService.PreSimulation.Connect((deltaTime) => {
            this.executeCallbacks(this.preSimulationCallbacks, deltaTime);
        });
    }

    private static ensurePreRenderConnection(): void {
        if (this.preRenderConnection !== undefined) {
            return;
        }

        this.preRenderConnection = RunService.PreRender.Connect((deltaTime) => {
            this.executeCallbacks(this.preRenderCallbacks, deltaTime);
        });
    }

    private static executeCallbacks(
        callbacks: Map<string, CallbackEntry>,
        deltaTime: number,
    ): void {
        for (const [, entry] of callbacks) {
            this.reuseThread(() => {
                try {
                    entry.callback(deltaTime);
                } catch (err) {
                    warn(`FrameScheduler callback error (${entry.id}): ${err}`);
                }
            });
        }
    }

    private static unsubscribeHeartbeat(id: string): void {
        this.heartbeatCallbacks.delete(id);

        if (this.heartbeatCallbacks.isEmpty()) {
            this.heartbeatConnection?.Disconnect();
            this.heartbeatConnection = undefined;
        }
    }

    private static unsubscribePreSimulation(id: string): void {
        this.preSimulationCallbacks.delete(id);

        if (this.preSimulationCallbacks.isEmpty()) {
            this.preSimulationConnection?.Disconnect();
            this.preSimulationConnection = undefined;
        }
    }

    private static unsubscribePreRender(id: string): void {
        this.preRenderCallbacks.delete(id);

        if (this.preRenderCallbacks.isEmpty()) {
            this.preRenderConnection?.Disconnect();
            this.preRenderConnection = undefined;
        }
    }

    private static reusableThread = (func: () => void): void => {
        const thread = coroutine.running();
        const shouldContinue = true;

        while (shouldContinue) {
            if (this.inactiveThread === thread) {
                this.inactiveThread = undefined;
            }
            func();
            if (this.inactiveThread !== undefined) {
                break;
            }
            this.inactiveThread = thread;
            const result = coroutine.yield() as LuaTuple<[() => void]>;
            [func] = result;
        }
    };

    private static reuseThread(func: () => void): void {
        if (this.inactiveThread !== undefined) {
            const thread = this.inactiveThread;
            this.inactiveThread = undefined;
            task.spawn(thread, func);
        } else {
            task.spawn(this.reusableThread, func);
        }
    }
}
