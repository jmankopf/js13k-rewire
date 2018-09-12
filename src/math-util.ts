// https://gist.github.com/blixt/f17b47c62508be59987b
const clamp = (num: number, min: number, max: number): number => num < min ? min : num > max ? max : num;

// https://gist.github.com/Joncom/e8e8d18ebe7fe55c3894
const lineLineIntersect = (line1a: Vec2, line1b: Vec2, line2a: Vec2, line2b: Vec2): boolean => {
    // var s1_x, s1_y, s2_x, s2_y;
    const s1_x = line1b.x - line1a.x;
    const s1_y = line1b.y - line1a.y;
    const s2_x = line2b.x - line2a.x;
    const s2_y = line2b.y - line2a.y;

    // var s, t;
    const s = (-s1_y * (line1a.x - line2a.x) + s1_x * (line1a.y - line2a.y)) / (-s2_x * s1_y + s1_x * s2_y);
    const t = (s2_x * (line1a.y - line2a.y) - s2_y * (line1a.x - line2a.x)) / (-s2_x * s1_y + s1_x * s2_y);

    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
};

// borrowed from https://codereview.stackexchange.com/questions/192477/circle-line-segment-collision
const lineCircleIntersect = (lineA: Vec2, lineB: Vec2, circle: Vec2, radius: number): boolean => {
    let dist;
    const v1x = lineB.x - lineA.x;
    const v1y = lineB.y - lineA.y;
    const v2x = circle.x - lineA.x;
    const v2y = circle.y - lineA.y;
    // get the unit distance along the line of the closest point to
    // circle center
    const u = (v2x * v1x + v2y * v1y) / (v1y * v1y + v1x * v1x);

    // if the point is on the line segment get the distance squared
    // from that point to the circle center
    if (u >= 0 && u <= 1) {
        dist = (lineA.x + v1x * u - circle.x) ** 2 + (lineA.y + v1y * u - circle.y) ** 2;
    } else {
        // if closest point not on the line segment
        // use the unit distance to determine which end is closest
        // and get dist square to circle
        dist = u < 0 ?
            (lineA.x - circle.x) ** 2 + (lineA.y - circle.y) ** 2 :
            (lineB.x - circle.x) ** 2 + (lineB.y - circle.y) ** 2;
    }
    return dist < radius * radius;
};

// https://jsfiddle.net/MadLittleMods/0eh0zeyu/
const dist2 = (pt1: Vec2, pt2: Vec2) => Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2);

// https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Tangents_between_two_circles
const getTangents = (p1: Vec2, r1: number, p2: Vec2, r2: number): Vec2[][] => {
    let d_sq = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);

    if (d_sq <= (r1 - r2) * (r1 - r2)) return [];

    let d = Math.sqrt(d_sq);
    let vx = (p2.x - p1.x) / d;
    let vy = (p2.y - p1.y) / d;

    // double[][] res = new double[4][4];
    let result = [];
    let i = 0;

    // Let A, B be the centers, and C, D be points at which the tangent
    // touches first and second circle, and n be the normal vector to it.
    //
    // We have the system:
    //   n * n = 1          (n is a unit vector)
    //   C = A + r1 * n
    //   D = B +/- r2 * n
    //   n * CD = 0         (common orthogonality)
    //
    // n * CD = n * (AB +/- r2*n - r1*n) = AB*n - (r1 -/+ r2) = 0,  <=>
    // AB * n = (r1 -/+ r2), <=>
    // v * n = (r1 -/+ r2) / d,  where v = AB/|AB| = AB/d
    // This is a linear equation in unknown vector n.

    for (let sign1 = +1; sign1 >= -1; sign1 -= 2) {
        let c = (r1 - sign1 * r2) / d;

        // Now we're just intersecting a line with a circle: v*n=c, n*n=1

        if (c * c > 1.0) continue;
        let h = Math.sqrt(Math.max(0.0, 1.0 - c * c));

        for (let sign2 = +1; sign2 >= -1; sign2 -= 2) {
            let nx = vx * c - sign2 * h * vy;
            let ny = vy * c + sign2 * h * vx;
            result[i] = [];
            const a = result[i] = new Array(2);
            a[0] = {x: p1.x + r1 * nx, y: p1.y + r1 * ny};
            a[1] = {x: p2.x + sign1 * r2 * nx, y: p2.y + sign1 * r2 * ny};
            i++;
        }
    }

    return result;
};


const sideOfLine = (p1: Vec2, p2: Vec2, p: Vec2): Side => ((p2.x - p1.x) * (p.y - p1.y) - (p2.y - p1.y) * (p.x - p1.x)) > 0 ? Side.left : Side.right;

