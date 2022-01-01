import { Actor } from '../Actor';
import { kill } from '../combat';
import { EnemyNinja } from '../en/EnemyNinja';
import { Skill } from '../Skill';
import { findSpace, isBlocked } from '../tools';
import { XY } from '../types';

export const Clone: Skill = {
    name: 'Clone',
    balance: 0,
    ki: 5,
    moveTimer: 0.5,
    fn: (a) => {
        const g = a.g;
        const mastered = a.skillsMastered.includes(Clone.name);

        let dest: XY | undefined = g.f.map.addFacing(a.pos, a.facing);
        if (isBlocked(g, dest)) {
            dest = findSpace(g, a.pos, 1);
            if (!dest) {
                if (a.isPlayer) g.log.error("There's no space for a clone!");
                return false;
            }
        }

        a.ki -= Clone.ki;
        a.balance -= Clone.balance;

        if (a.isPlayer) g.log.info('You conjure a copy of yourself.');
        else
            g.log.info(
                "A flash of light catches you off guard... now you're seeing double!",
            );

        const cloneHP = mastered ? a.hpMax / 2 : 1;
        const cloneTimer = mastered ? Infinity : 10;

        const clone = new EnemyNinja(g);
        clone.isEnemy = a.isEnemy;
        clone.pos = dest;
        clone.name = a.name;
        clone.hp = clone.base.hpMax = cloneHP;
        clone.ai = ninjaCloneAI.bind(clone);
        clone.cloneOf = a;
        clone.side = a.side;
        clone.lifetime = g.timer + cloneTimer;
        clone.char = a.char;
        clone.fg = a.fg;
        clone.bg = a.bg;
        clone.facing = a.facing;
        g.add(clone);

        a.spend(Clone.moveTimer);
        return true;
    },
};

function ninjaCloneAI(this: Actor) {
    if (this.lifetime <= this.g.timer) {
        kill(this, this);
        return false;
    }

    // TODO other ai?
    return false;
}

export function swapPositionWithClone(ninja: Actor, clone: Actor) {
    const g = ninja.g;
    const nr = ninja.pos;
    const nf = ninja.facing;
    const cr = clone.pos;
    const cf = clone.facing;

    ninja.pos = cr;
    ninja.facing = cf;
    clone.pos = nr;
    clone.facing = nf;

    g.actors.forEach((a) => {
        if (a.target === ninja) {
            a.target = clone;
            console.log(a.name, 'target reassigned to clone.');
        } else if (a.target === clone) {
            a.target = ninja;
            console.log(a.name, 'target reassigned to ninja.');
        }
    });

    if (ninja.isPlayer) {
        g.log.info('You quickly swap places with your clone.');
        g.hooks.fire('player.move', { actor: ninja, from: cr });
    }
}
