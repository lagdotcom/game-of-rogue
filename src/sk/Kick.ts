import { describeTile } from '../Architect';
import { colourEnemyHit, colourPlayerHit } from '../colours';
import { combatAlert, damage } from '../combat';
import { dirOffsets } from '../constants';
import { Skill } from '../Skill';
import { Tile } from '../types';

export const Kick: Skill = {
    name: 'Kick',
    balance: 3,
    ki: 3,
    moveTimer: 1,
    fn: (a) => {
        const g = a.g;
        const o = dirOffsets[a.facing];
        const dest = g.f.map.addFacing(a.pos, a.facing);
        const b = g.blockers(dest);
        if (!b.length) {
            g.log.error("There's nobody in front of you.");
            return false;
        }
        const v = b[0];
        const vOld = v.pos;

        g.log.coloured(
            v.isPlayer ? colourPlayerHit : colourEnemyHit,
            '%ao foot smashes into %bo chest!',
            a,
            v,
        );

        a.ki -= Kick.ki;
        a.balance -= Kick.balance;

        const mapWidth = g.f.map.width;
        const mapHeight = g.f.map.height;

        let dmg = a.strength;
        let distance = a.skillsMastered.includes(Kick.name) ? Infinity : 5;
        while (distance > 0) {
            const vx = v.pos.x;
            const vy = v.pos.y;
            const tx = vx + o.x;
            const ty = vy + o.y;
            const tr = g.f.map.ref(tx, ty);
            const tile = g.f.map.get(tx, ty);
            const occupants = g.blockers(tr);

            if (tile === Tile.Wall || tile === Tile.Door) {
                const description = describeTile(tile);
                let rekt = false;

                if (
                    tx > 0 &&
                    tx < mapWidth - 1 &&
                    ty > 0 &&
                    ty < mapHeight - 1
                ) {
                    rekt = true;
                    g.noise.add(tr, 12, a, 3);

                    g.f.map.set(tx, ty, Tile.Space);
                    // plug leaks
                    g.f.map.square(tr, 1).forEach((pos) => {
                        if (g.f.map.get(pos.x, pos.y) === Tile.Empty)
                            g.f.map.set(pos.x, pos.y, Tile.Wall);
                    });
                }

                const suffix = rekt ? ', destroying it!' : '!';
                g.log.info(`%an plow%as into ${description}${suffix}`, v);

                dmg *= 1.5;
                distance = 0;
            } else if (occupants.length) {
                const blocker = occupants[0];
                g.log.coloured(
                    blocker.isPlayer || v.isPlayer
                        ? colourPlayerHit
                        : colourEnemyHit,
                    '%an plow%as into %bn!',
                    v,
                    blocker,
                );

                g.noise.add(tr, 6, a, 3);
                damage(a, blocker, dmg);

                dmg *= 1.5;
                distance = 0;
            }

            v.pos = tr;
            distance--;
        }

        if (v.isPlayer) {
            g.hooks.fire('player.move', { actor: v, from: vOld });
        }

        if (damage(a, v, dmg)) {
            g.log.info('%an stagger%as to a stop.', v);
            combatAlert(a, v);
        }

        a.spend(Kick.moveTimer);
        return true;
    },
};
