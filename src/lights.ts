import { Tile, XY } from './types';
import { LIGHTS_FRAGMENTS, dirAngles, LIGHTS_STEP } from './consts';
import { deg2rad, mid } from './tools';
import { Actor } from './Actor';

export function getSightCone(a: Actor) {
    let set = new Set<XY>();
    let cx = mid(a.pos.x);
    let cy = mid(a.pos.y);

    let sideangle = -a.sightFov / 2;
    let modangle = dirAngles[a.facing];
    let startang = modangle + sideangle;
    if (startang < 0) startang += 360;
    let ang = startang;
    let anglesteps = a.sightFov / LIGHTS_STEP + 1;

    a.g.t.enter('getSightCone', a);
    for (let s = 0; s < anglesteps; s++) {
        ang = modangle + sideangle;
        if (ang < 0) ang += 360;
        let rad = deg2rad(ang);

        let ex = cx + a.sightRange * Math.cos(rad);
        let ey = cy + a.sightRange * Math.sin(rad);

        let results = a.g.trace(
            cx,
            cy,
            ex,
            ey,
            a.sightRange * LIGHTS_FRAGMENTS,
            p => {
                // can always see own tile
                if (p == a.pos) return true;

                let tile = a.g.f.map.get(p.x, p.y);
                return tile === Tile.Space;
            },
        );
        sideangle += LIGHTS_STEP; // deg

        results.visited.forEach(p => set.add(p));
    }
    a.g.t.message('set', set);
    a.g.t.leave('getSightCone');

    return set;
}
