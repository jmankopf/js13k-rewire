const createCanvas = (width: number, height: number): [Canvas, Context] => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d') as Context;
    return [canvas, context];
};
