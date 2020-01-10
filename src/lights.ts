import { Actor, Tile, XY } from './types';
import { LIGHTS_FRAGMENTS, dirAngles, LIGHTS_STEP } from './consts';
import { deg2rad } from './tools';

export function getSightCone(a: Actor) {
    let set = new Set<XY>();
    let cx = a.pos.x;
    let cy = a.pos.y;

    let sideangle = -a.fov / 2;
    let modangle = dirAngles[a.facing];
    let startang = modangle + sideangle;
    if (startang < 0) startang += 360;
    let ang = startang;
    let anglesteps = a.fov / LIGHTS_STEP + 1;

    a.g.t.enter('getSightCone', a);
    for (let s = 0; s < anglesteps; s++) {
        ang = modangle + sideangle;
        if (ang < 0) ang += 360;
        let rad = deg2rad(ang);

        let ex = cx + a.sight * Math.cos(rad);
        let ey = cy + a.sight * Math.sin(rad);

        let results = a.g.trace(
            cx,
            cy,
            ex,
            ey,
            a.sight * LIGHTS_FRAGMENTS,
            p => {
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
