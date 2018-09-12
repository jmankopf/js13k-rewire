const nextFrame = requestAnimationFrame;
const startFrameLoop = (callback: (time: number) => void ) => {

    let requestId: number;
    let stopLoop:boolean = false;
    let lastTime = 0;
    const update = (time: number) => {
        callback(time * 0.001);
        if (!stopLoop) {
            requestId = nextFrame(update);
        }
        lastTime = time;
    };
    requestId= nextFrame(update);

    return () => {
        stopLoop = true;
    };
};

const tween = (from: number, to: number, duration:number, onUpdate: (t: number) => void, onComplete: () => void) => {
    const startTime = performance.now();
    const update = (time: number) => {
        let t = 1/duration * (time-startTime)*0.001;
        if (t < 1) {
            onUpdate(from+(to-from)*t);
            nextFrame(update);
        } else {
            onUpdate(to);
            nextFrame(onComplete);
        }
    };
    update(startTime);
};
