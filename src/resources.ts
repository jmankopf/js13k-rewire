/// <reference path="gfx-generator.ts" />
type SpriteMap = { [size: number]: Canvas };
type ResLoadCalls = () => void;
type Resources = {
    coils: SpriteMap;
    blocks: SpriteMap;
    isolators: SpriteMap;
    led: Canvas;
    drag: Canvas;
    dragGlow: Canvas;
    finish: Canvas;
    start: Canvas;
    greenGlow: Canvas;
    redGlow: Canvas;
    tutorial1: Canvas;
    tutorial2: Canvas;
};
const generateResources = (onProgress: (percent: number) => void, onDone: (resources: Resources) => void) => {
    const resCalls: ResLoadCalls[] = [];
    const coilSprites: SpriteMap = {};
    const blockSprites: SpriteMap = {};
    const isolatorSprites: SpriteMap = {};
    [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160].forEach(size => {
        resCalls.push(() => {
            coilSprites[size] = createCoilSprite(size * 2 + 10);
        });
    });
    [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160].forEach(size => {
        resCalls.push(() => {
            blockSprites[size] = createBlockSprite(size * 2 + 6);
        });
    });
    [30, 40, 50, 60, 70, 80].forEach(size => {
        resCalls.push(() => {
            isolatorSprites[size] = createIsolatorSprite(size * 2 + 10);
        });
    });

    const led = createLedSprite();
    const greenGlow = createGlow(newCol(0, 1, 0));
    const redGlow = createGlow(newCol(1, 0, 0));
    const dragPoint = createConnectorButtons(newCol(0.2, 0.6, 0.2),70);
    const start = createConnectorButtons(newCol(0.2, 0.2, 0.2),52);
    const dragGlow = createRingGlow(newCol(0, 1, 0));
    const finish = createConnectorButtons(newCol(1, 0.4, 0.4),70);

    //Tutorial Screens
    const [tutorial1, tutCtx1] = createCanvas(450, 264);
    tutorial1.className = 'tutorial';
    tutCtx1.font = '20px sans-serif';
    tutCtx1.fillStyle = '#ccc';
    tutCtx1.fillText('1. Drag the cable ...', 20, 50);
    tutCtx1.drawImage(dragPoint, 358, 10);
    tutCtx1.fillText('2. ...around the power nodes...', 20, 140);
    tutCtx1.drawImage(createCoilSprite(80), 350, 90);
    tutCtx1.fillText('3. ...and plug it into the socket!', 20, 230);
    tutCtx1.drawImage(finish, 358, 190);

    const [tutorial2, tutCtx2] = createCanvas(450, 100);
    tutorial2.className = 'tutorial';
    tutCtx2.font = '20px sans-serif';
    tutCtx2.fillStyle = '#ccc';
    tutCtx2.fillText('Isolated cables can overlap others ', 20, 55);
    tutCtx2.drawImage(createIsolatorSprite(80), 358, 10);


    const numResources = resCalls.length;
    let numGenerated = 0;
    (function nextRes() {
        const nextCall = resCalls.shift();
        if (nextCall) {
            nextCall();
            onProgress(100 / numResources * ++numGenerated);
            requestAnimationFrame(nextRes);
        } else {
            onDone({
                coils: coilSprites,
                blocks: blockSprites,
                isolators: isolatorSprites,
                greenGlow,
                redGlow,
                led,
                drag: dragPoint,
                dragGlow,
                finish,
                tutorial1,
                tutorial2,
                start
            });
        }
    })();

};
