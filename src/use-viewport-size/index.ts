import { useState } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { useEventListener } from "../use-event-listener";

export function useViewportSize(): Vector2 {
    const [camera, setCamera] = useState<Camera | undefined>(Workspace.CurrentCamera);
    const [size, setSize] = useState<Vector2>(
        Workspace.CurrentCamera?.ViewportSize ?? Vector2.zero,
    );

    useEventListener(Workspace.GetPropertyChangedSignal("CurrentCamera"), () => {
        const newCamera = Workspace.CurrentCamera;

        if (newCamera !== undefined) {
            setSize(newCamera.ViewportSize);
        }

        setCamera(newCamera);
    });

    useEventListener(camera?.GetPropertyChangedSignal("ViewportSize"), () => {
        setSize(camera?.ViewportSize ?? Vector2.zero);
    });

    return size;
}
