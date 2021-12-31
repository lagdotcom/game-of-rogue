import { Floor } from './Floor';
import { distance } from './tools';
import { Tile, XY } from './types';

export function makePath(f: Floor, start: XY, goal: XY) {
    const closed = new Set<XY>();
    const open = new Set<XY>([start]);
    const from = new Map<XY, XY>();

    const gScore = new Map<XY, number>();
    gScore.set(start, 0);
    const fScore = new Map<XY, number>();
    fScore.set(start, distance(start, goal));

    while (open.size) {
        const current = pathLowest(open, fScore);
        if (current === goal) return reconstructPath(from, goal);

        open.delete(current);
        closed.add(current);

        neighbours(f, current).forEach((n) => {
            if (closed.has(n)) return;
            if (f.map.get(n.x, n.y) === Tile.Wall) return;

            const tentative = gScore.get(current) + 1;
            if (!open.has(n)) open.add(n);
            else if (tentative >= gScore.get(n)) return;

            from.set(n, current);
            gScore.set(n, tentative);
            fScore.set(n, tentative + distance(n, goal));
        });
    }

    // TODO return closest path?
}

function pathLowest(positions: Set<XY>, scores: Map<XY, number>) {
    let best: XY | undefined = undefined;
    let bestScore = Infinity;

    for (const pos of positions) {
        const score = scores.get(pos);
        if (score < bestScore) {
            best = pos;
            bestScore = score;
        }
    }

    return best;
}

function neighbours(f: Floor, pos: XY) {
    const n: XY[] = [];

    const canLeft = pos.x > 0;
    const canUp = pos.y > 0;
    const canRight = pos.x < f.map.width - 1;
    const canDown = pos.y < f.map.height - 1;

    if (canLeft) {
        n.push(f.map.ref(pos.x - 1, pos.y));
        if (canUp) n.push(f.map.ref(pos.x - 1, pos.y - 1));
        if (canDown) n.push(f.map.ref(pos.x - 1, pos.y + 1));
    }
    if (canUp) n.push(f.map.ref(pos.x, pos.y - 1));
    if (canRight) {
        n.push(f.map.ref(pos.x + 1, pos.y));
        if (canUp) n.push(f.map.ref(pos.x + 1, pos.y - 1));
        if (canDown) n.push(f.map.ref(pos.x + 1, pos.y + 1));
    }
    if (canDown) n.push(f.map.ref(pos.x, pos.y + 1));

    return n;
}

function reconstructPath(links: Map<XY, XY>, goal: XY) {
    const route: XY[] = [goal];
    let current = goal;

    while (links.has(current)) {
        current = links.get(current);
        route.unshift(current);
    }

    return route;
}
