/// <reference path="math-util.ts" />
const fract = (n:number) =>  ((n % 1) + 1) % 1;

const subV = (v1: Vec2, v2: Vec2): Vec2 => ({x: v1.x - v2.x, y: v1.y - v2.y});
const addV = (v1: Vec2, v2: Vec2): Vec2 => ({x: v1.x + v2.x, y: v1.y + v2.y});
const mulVS = (v: Vec2, s: number): Vec2 => ({x: v.x * s, y: v.y * s});
const divVS = (v: Vec2, s: number): Vec2 => mulVS(v, 1 / s);
const lenV = (v: Vec2): number => Math.sqrt(v.x * v.x + v.y * v.y);
const distV = (v1: Vec2, v2: Vec2): number => lenV(subV(v1, v2));
const normalizeV = (v: Vec2): Vec2 => divVS(v, lenV(v) || 1);
const perpLeftV = (v: Vec2) => ({x: -v.y, y: v.x});
const perpRightV = (v: Vec2) => ({x: v.y, y: -v.x});
const angleV = (v: Vec2): number => {
    let angle = Math.atan2(v.y, v.x);
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
};
const copyIntoV = (target: Vec2, source: Vec2): void => {
    target.x = source.x;
    target.y = source.y;
};
const copyV = (source: Vec2): Vec2 => ({x:source.x, y: source.y});
const fractV = (v: Vec2) => ({x: fract(v.x), y: fract(v.y)});
const floorV = (v: Vec2) => ({x: ~~v.x, y: ~~v.y});
