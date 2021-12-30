import { Actor } from './Actor';
import { dirAngles, LIGHTS_FRAGMENTS, LIGHTS_STEP } from './constants';
import { deg2rad, mid } from './tools';
import { Tile, XY } from './types';

export function getSightCone(a: Actor) {
    const set = new Set<XY>();
    const cx = mid(a.pos.x);
    const cy = mid(a.pos.y);

    let sideAngle = -a.sightFov / 2;
    const modAngle = dirAngles[a.facing];
    let startAngle = modAngle + sideAngle;
    if (startAngle < 0) startAngle += 360;
    let ang = startAngle;
    const angleSteps = a.sightFov / LIGHTS_STEP + 1;

    //a.g.t.enter('getSightCone', a);
    for (let s = 0; s < angleSteps; s++) {
        ang = modAngle + sideAngle;
        if (ang < 0) ang += 360;
        const rad = deg2rad(ang);

        const ex = cx + a.sightRange * Math.cos(rad);
        const ey = cy + a.sightRange * Math.sin(rad);

        const results = a.g.trace(
            cx,
            cy,
            ex,
            ey,
            a.sightRange * LIGHTS_FRAGMENTS,
            (p) => {
                // can always see own tile
                if (p === a.pos) return true;

                const tile = a.g.f.map.get(p.x, p.y);
                return tile === Tile.Space;
            },
        );
        sideAngle += LIGHTS_STEP; // deg

        results.visited.forEach((p) => set.add(p));
    }
    //a.g.t.message('set', set);
    //a.g.t.leave('getSightCone');

    return set;
}

export function canSee(a: Actor, pos: XY) {
    return getSightCone(a).has(pos);
}

export function getVisibleEnemies(a: Actor) {
    const cone = getSightCone(a);
    return a.g.actors.filter((v) => v.side !== a.side && cone.has(v.pos));
}
