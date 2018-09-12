/// <reference path="canvas.ts" />
/// <reference path="vector.ts" />

const mix = (a: number, b: number, m: number) => (1 - m) * a + m * b;
const mixCol = (a: Color, b: Color, m: number): Color => ({
    r: mix(a.r, b.r, m),
    g: mix(a.g, b.g, m),
    b: mix(a.b, b.b, m),
    a: mix(a.a, b.a, m),
});

const halfV = {x: 0.5, y: 0.5};
const v10 = {x: 1, y: 0};
const v01 = {x: 0, y: 1};
const v11 = {x: 1, y: 1};
const n21 = (v: Vec2): number => ((Math.sin(v.x * 100 + v.y * 6574) + 1) * 564) % 1;

const noise = (v: Vec2): number => {
    const lv = fractV(v);
    const id = floorV(v);
    const bl = n21(id);
    const br = n21(addV(id, v10));
    const b = mix(bl, br, lv.x);

    const tl = n21(addV(id, v01));
    const tr = n21(addV(id, v11));

    const t = mix(tl, tr, lv.x);

    return mix(b, t, lv.y);
};
const smoothstep = (min: number, max: number, value: number) => {
    const x = clamp((value - min) / (max - min), 0, 1);
    return x * x * (3 - 2 * x);
};
const newCol = (r: number = 1, g: number = 1, b: number = 1, a: number = 1): Color => ({r, g, b, a});
const mulCol = (color: Color, v: number) => ({
    r: color.r * v,
    g: color.g * v,
    b: color.b * v,
    a: color.a
});

const addCol = (a: Color, b: Color) => {
    return {
        r: a.r + b.r * b.a,
        g: a.g + b.g * b.a,
        b: a.b + b.b * b.a,
        a: a.a + b.a
    };
};
const generateImage = (width: number, height: number, cb: (v: Vec2) => Color) => {
    const [canvas, context] = createCanvas(width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const buf = new ArrayBuffer(imageData.data.length);
    const buf8 = new Uint8ClampedArray(buf);
    const data32 = new Uint32Array(buf);
    const v: Partial<Vec2> = {};

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            v.x = x / (width - 1);
            v.y = y / (height - 1);
            const c = cb(v as Vec2);
            data32[y * width + x] =
                (clamp(c.a! * 255, 0, 255) << 24) |    // alpha
                (clamp(c.b! * 255, 0, 255) << 16) |    // blue
                (clamp(c.g! * 255, 0, 255) << 8) |    // green
                clamp(c.r! * 255, 0, 255);
        }
    }
    imageData.data.set(buf8);
    context.putImageData(imageData, 0, 0);

    return canvas;
};

// https://gist.github.com/sakrist/8706749
const createHexField = (v: Vec2, scale: number): number => {
    let {x, y} = mulVS(v, scale);
    x *= 0.57735 * 2.0;
    y += (Math.floor(x) % 2) * 0.5;
    x = Math.abs(x % 1 - 0.5);
    y = Math.abs(y % 1 - 0.5);
    return Math.abs(Math.max(x * 1.5 + y, y * 2.0) - 1.0);
};

const createMetalPlate = (a: number, d: number): number => {
    const shading = smoothstep(0.91, 0.94, d) - smoothstep(0.41, 0.42, d);
    a += shading;
    return 0.9 + 0.1 * Math.sin(a * 6) * 0.9 + 0.1 * Math.sin(a * 4)
        - (noise({x: (a + 4 + d * 5) * 2, y: d * 80}) * 0.1) + shading * 0.2;
};

const createCoilSprite = (size: number): Canvas => {
    const sw = 4 / size;
    const hexFieldScale = size / 4;
    const hexFieldBrightness = 0.7;
    const ringBrightness = 0.4;
    const gridShadowBlur = 0.1;
    const gridShadowStrength = 1;
    const ringWidth = 0.2;
    const buttonSize = 0.5;
    const gridColor = newCol(0.615, 0.705, 1, 1);
    const metalColor = newCol(1, 1, 1, 1);
    const shadowBlur = 0.2;
    const shadowDistance = 0.04;
    const shadowScale = 1.1;
    const shadowStrength = 0.5;

    const image = generateImage(Math.round(size * 1.1), Math.round(size * 1.1), v => {
        v = mulVS(v, 1.1); // scale to make room for shadow
        const centerV = subV(v, halfV);
        const a = Math.atan2(centerV.y, centerV.x);
        const d = lenV(centerV) * 2;
        let grid = hexFieldBrightness * smoothstep(0.3, 1, 1 - createHexField(v, hexFieldScale)); // TODO: FOR SPOOL
        const gridShadow = 1 - (smoothstep(1 - ringWidth * 0.65, 1 - ringWidth - gridShadowBlur, d) -
            smoothstep(buttonSize + gridShadowBlur, buttonSize * 0.85, d));
        grid -= (gridShadow * gridShadowStrength);

        const metalPlate = createMetalPlate(a, d) * ringBrightness;
        const ringMask = smoothstep(1 - ringWidth, 1 - ringWidth + sw, d) + smoothstep(buttonSize, buttonSize - sw, d);
        const spriteCol = mixCol(mulCol(gridColor, grid), mulCol(metalColor, metalPlate), ringMask);

        const shadow = smoothstep(1, 1 - shadowBlur, lenV(subV(centerV, {
            x: shadowDistance,
            y: shadowDistance
        })) * 2 / shadowScale) * shadowStrength;
        const shadowCol = newCol(0, 0, 0, shadow);

        return mixCol(spriteCol, shadowCol, smoothstep(1 - sw, 1, d));
    });

    return image;

};

const createIsolatorSprite = (size: number): Canvas => {
    const sw = 4 / size;
    const hexFieldScale = size / 8;
    const hexFieldBrightness = 0.7;
    const ringBrightness = 0.4;
    const gridShadowBlur = 0.2;
    const gridShadowStrength = 0.6;
    const ringWidth = 0.15;
    const buttonSize = 0.3;
    const gridColor = newCol(0.815, 0.2705, .2, 1); // isolate red
    const metalColor = newCol(1, 1, 1, 1);
    const shadowBlur = 0.2;
    const shadowDistance = 0.04;
    const shadowScale = 1.1;
    const shadowStrength = 0.5;

    const image = generateImage(Math.round(size * 1.1), Math.round(size * 1.1), v => {
        v = mulVS(v, 1.1); // scale to make room for shadow
        const centerV = subV(v, halfV);
        const a = Math.atan2(centerV.y, centerV.x); // polar x
        const d = lenV(centerV) * 2;                // polar y
        let grid = hexFieldBrightness * smoothstep(0.02, 0.41, 1 - createHexField(v, hexFieldScale)); // TODO FOR ISOLATOR
        const gridShadow = 1 - (smoothstep(1 - ringWidth * 0.65, 1 - ringWidth - gridShadowBlur, d) -
            smoothstep(buttonSize + gridShadowBlur, buttonSize * 0.85, d));
        grid -= (gridShadow * gridShadowStrength);

        const metalPlate = createMetalPlate(a, d) * ringBrightness;
        const ringMask = smoothstep(1 - ringWidth, 1 - ringWidth + sw, d) + smoothstep(buttonSize, buttonSize - sw, d);
        const spriteCol = mixCol(mulCol(gridColor, grid), mulCol(metalColor, metalPlate), ringMask);

        const shadow = smoothstep(1, 1 - shadowBlur, lenV(subV(centerV, {
            x: shadowDistance,
            y: shadowDistance
        })) * 2 / shadowScale) * shadowStrength;
        const shadowCol = newCol(0, 0, 0, shadow);

        return mixCol(spriteCol, shadowCol, smoothstep(1 - sw, 1, d));
    });

    return image;

};

const createGear = (px:number, py:number, outerSize: number, innerSize:number, step: number): number => {
    const s = Math.min(fract(px), fract(1 - px)) * 2;
    const spikes = smoothstep(0, step*8, s - py);
    const center = smoothstep(innerSize, innerSize+step, 1 - py);
    const cut = smoothstep(outerSize+step,outerSize , 1 - py);
    return clamp(spikes +center - cut, 0,1);
};

const createBlockSprite = (size: number): Canvas => {
    const image = generateImage(size, size, v => {
        const cv = subV(v, halfV);
        const d = lenV(cv) * 2;
        const atan = Math.atan2(cv.y, cv.x);
        const px = atan / (Math.PI * 2) + 0.5;    // polar twistedMx
        const twistedPx = atan / (Math.PI * 2) + 0.5 + d * 0.3;    // polar twistedMx
        const twistedMx = twistedPx * Math.round(8+size/50);
        const mx = px * Math.round(5+size/200);
        const m = Math.min(fract(twistedMx), fract(1 - twistedMx));
        let bladeAlpha = smoothstep(0.0, 0.08, m * 0.5 - d + 0.7);
        let shadow = 1-smoothstep(0.9, 0.2, d);
        let blade = 1.4 * d - bladeAlpha * 0.5;
        let gear = createGear(mx, d, 0.45, 0.52, 0.02);
        let gearCol = 0.5+0.5*createMetalPlate(atan*1, d);
        blade = mix(mix(shadow, blade, bladeAlpha), gear*0.3*gearCol, gear);
        return newCol(blade, blade, blade, bladeAlpha+(1-shadow));
    });
    return image;

};

const createInnerShadow = (v: Vec2): Color => {
    const d = lenV(v) * 2;
    const dm = lenV(subV(v, mulVS(v11, 0.05))) * 2;
    const val = smoothstep(1, 0.5, dm * 0.8) * 0.2;
    const a = smoothstep(1, 0.85, d);
    return newCol(val, val, val, a);
};
const createLedGlass = (v: Vec2): Color => {
    const d = (lenV(v) * 2) * 1.2;
    const val = smoothstep(1, 0.0, d) * 0.25;
    const a = smoothstep(0.99, 0.9, d);
    return newCol(val, val, val, a);
};
const createLedGlassReflection = (v: Vec2): Color => {
    const d = (lenV(v) * 2) * 1.5;
    const dm = lenV(subV(v, mulVS(v11, 0.14))) * 1.01;
    const val = smoothstep(1, 0.6, d) *
        smoothstep(0.2, 0.5, dm);
    return newCol(val, val, val, val);
};
const createLedSprite = (): Canvas => generateImage(21, 21, v => {
    const cv = subV(v, halfV);
    const innerShadow = createInnerShadow(cv);
    const ledGlass = createLedGlass(cv);
    const ledGlassReflection = createLedGlassReflection(cv);

    return addCol(addCol(innerShadow, ledGlass), ledGlassReflection);
});

const white = newCol(1, 1, 1, 1);
const createGlow = (color:Color): Canvas => generateImage(80, 80, v => {
    const cv = subV(v, halfV);
    const d = 1 - lenV(cv) * 2;
    const result = mixCol(color, white, smoothstep(0.6, 0.89, d));

    const a = smoothstep(0.0, 1, d);
    return newCol(result.r, result.g, result.b, a*a*a);
});

const createMetal = (a: number, d: number): number => {
    return 0.9 + 0.1 * Math.sin(a * 6) * 0.9 + 0.1 * Math.sin(a * 4)
        - (noise({x: (a + 4 + d * 5) * 2, y: d * 80}) * 0.1);
};

const createRingGlow = (color:Color): Canvas => generateImage(62, 62, v => {
    const cv = subV(v, halfV);
    const d = 1 - lenV(cv) * 2;
    const result = mixCol(color, white, smoothstep(0.45, 0.5, d)*smoothstep(0.55, 0.5, d));
    const a = smoothstep(0.0, 0.5, d)*smoothstep(1, 0.5, d);
    return newCol(result.r, result.g, result.b, a*a*a);
});


const createConnectorButtons = (lightColor:Color, size:number): Canvas => {
    const shadowBlur = 0.2;
    const shadowDistance = 0.04;
    const shadowScale = 1.1;
    const shadowStrength = 0.2;
    const image = generateImage(size, size, v => {
        v = mulVS(v, 1.1); // scale to make room for shadow
        const cv = subV(v, halfV);

        const atan = Math.atan2(cv.y, cv.x);
        const py = lenV(cv) * 2;

        // back
        const backAlpha = smoothstep(1, .96, py);
        let shading = smoothstep(0.9, 0.80, py)*0.3+0.3;
        shading -= smoothstep(0.7, 0.60, py) * smoothstep(0.2, 0.30, py) * 0.4;
        const backVal = createMetal(atan+(shading*3), py) * shading;
        const backCol = newCol(backVal, backVal, backVal, backAlpha);

        // light
        const lightAlpha = smoothstep(0.35, 0.45, py)*smoothstep(0.55, 0.45, py);

        const col = mixCol(backCol, lightColor, lightAlpha);
        const shadow = smoothstep(1, 1 - shadowBlur, lenV(subV(cv, {
            x: shadowDistance,
            y: shadowDistance
        })) * 2 / shadowScale) * shadowStrength;
        const shadowCol = newCol(0, 0, 0, shadow);
        return mixCol(col, shadowCol, smoothstep(0.8, 1, py));
    });
    return image;
};

const createGameBackground = (): Canvas => {
    const [canvas, context] = createCanvas(1920, 1280);
    const image = generateImage(64, 64, v => {
        const m = mulVS(v, 4);
        const col = 1-smoothstep(0.7, 1, createHexField(m, 1))*0.7;
        return newCol(col * 0.117, col * 0.149, col * 0.188, 1);
    });

    const highlight = generateImage(128*2, 72*2, v => {
        const w = 0.01;
        const c = smoothstep(0, w*0.6, v.x)*smoothstep(1, 1-w*0.6, v.x)*
            smoothstep(0, w, v.y)*smoothstep(1, 1-w, v.y);

        return newCol(1, 1, 1, (1-c)*0.04);
    });

    for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 24; x++) {
            context.drawImage(image, x * 54, y * 63);
        }
    }

    context.drawImage(highlight, 0, 0, 1280, 720);
    return canvas;
};

