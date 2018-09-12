type Mouse = { pos: Vec2, leftDown: boolean; }
type InputCallback = (() => void) | undefined;
type InputCallbacks = {
    mouseOver?: InputCallback;
    mouseOut?: InputCallback;
    mouseDown?: InputCallback;
    mouseUp?: InputCallback;
    mouseDownUpdate?: InputCallback;
}

interface InputControl {
    mousePos: Vec2;
    isMouseDown: ()=>boolean;

    targets: [MouseDragEntity, InputCallbacks][];

    shutdown(): void;

    update(): void;

    dragControl(target: MouseDragEntity, callbacks: InputCallbacks): void;
}

const createInputControl = (canvas: Canvas): InputControl => {
    let mouseDown: boolean = false;
    const mousePos: Vec2 = {x: 0, y: 0};

    const mouseOverTargets: [MouseDragEntity, InputCallbacks][] = [];
    const mouseOutTargets: [MouseDragEntity, InputCallbacks][] = [];
    const mouseDownTargets: [MouseDragEntity, InputCallbacks][] = [];

    const mouseMoveListener = (e: MouseEvent) => {
        let rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
        e.preventDefault();
    };
    const mouseDownListener = (e: MouseEvent) => {
        mouseDown = true;
        mouseOverTargets.forEach(watch => {
            const mouseDownCallback = watch[1].mouseDown;
            mouseDownCallback && mouseDownCallback();
            mouseDownTargets.push(watch);
        });
        e.preventDefault();
    };
    const mouseUpListener = (e: MouseEvent) => {
        mouseDown = false;
        mouseDownTargets.forEach(watch => {
            const mouseUpCallback = watch[1].mouseUp;
            mouseUpCallback && mouseUpCallback();
        });
        mouseDownTargets.length = 0;
    };

    document.addEventListener('mousemove', mouseMoveListener);
    document.addEventListener('mousedown', mouseDownListener);
    document.addEventListener('mouseup', mouseUpListener);

    const dragControl = (target: MouseDragEntity, callbacks: InputCallbacks) => {
        mouseOutTargets.push([target, callbacks]);
    };

    const update = () => {
        for (let i = mouseOutTargets.length - 1; i >= 0; --i) {
            const watch = mouseOutTargets[i];
            const callbacks = watch[1];
            if (distV(mousePos, watch[0].pos) <= watch[0].mouseDrag.size) {
                callbacks.mouseOver && callbacks.mouseOver();
                mouseOutTargets.splice(i, 1);
                mouseOverTargets.push(watch);
            }
        }
        for (let i = mouseOverTargets.length - 1; i >= 0; --i) {
            const watch = mouseOverTargets[i];
            const callbacks = watch[1];

            mouseDown && callbacks.mouseDownUpdate && callbacks.mouseDownUpdate();
            if (distV(mousePos, watch[0].pos) > watch[0].mouseDrag.size) {
                callbacks.mouseOut && callbacks.mouseOut();
                mouseOverTargets.splice(i, 1);
                mouseOutTargets.push(watch);
            }
        }
    };
    const shutdown = () => {
        document.removeEventListener('mousemove', mouseMoveListener);
        document.removeEventListener('mousedown', mouseDownListener);
        document.removeEventListener('mouseup', mouseUpListener);
    };

    return {
        update,
        dragControl,
        mousePos,
        isMouseDown: () => (mouseDown),
        shutdown,
        targets:mouseOverTargets
    };
};



