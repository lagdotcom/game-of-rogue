import { Skill, Dir, Actor } from '../types';
import { dirOffsets } from '../consts';
import Player from '../Player';
import { attack } from '../combat';

const clockwise = {
    [Dir.N]: [Dir.NE, Dir.E, Dir.SE, Dir.S],
    [Dir.NE]: [Dir.E, Dir.SE, Dir.S, Dir.SW],
    [Dir.E]: [Dir.SE, Dir.S, Dir.SW, Dir.W],
    [Dir.SE]: [Dir.S, Dir.SW, Dir.W, Dir.NW],
    [Dir.S]: [Dir.SW, Dir.W, Dir.NW, Dir.N],
    [Dir.SW]: [Dir.W, Dir.NW, Dir.N, Dir.NE],
    [Dir.W]: [Dir.NW, Dir.N, Dir.NE, Dir.E],
    [Dir.NW]: [Dir.N, Dir.NE, Dir.E, Dir.SE],
};

function getSweepDir(from: Dir, to: Dir) {
    return clockwise[from].includes(to) ? 1 : -1;
}

function sweepAttack(a: Actor, ox: number, oy: number) {
    const p = a.g.f.map.ref(ox + a.pos.x, oy + a.pos.y);
    a.g.contents(p).forEach(v => {
        if (v.isActor) attack(a, <Actor>v);
    });
}

export const Sweep: Skill = {
    name: 'Skill',
    balance: 0,
    ki: 2,
    movetimer: 1.5,
    fn: a => {
        // TODO: AI
        a.g.input.getDirection('Turn to which direction?', dir => {
            if (a.facing === dir) {
                a.g.log.error("You're already facing that way!");
                return;
            }

            a.ki -= Sweep.ki;
            let facing = a.facing;
            let sweep = getSweepDir(a.facing, dir);
            let weaponname = 'weapon';
            a.g.log.info('%an sweep%as %ar %b#!', a, weaponname);

            while (facing !== dir) {
                facing += sweep;
                if (facing < 0) facing += 8;
                if (facing > 7) facing -= 8;

                let n = dirOffsets[facing];
                sweepAttack(a, n.x, n.y);

                a.balance -= Sweep.balance;
            }

            a.facing = facing;
            if (a.isPlayer) {
                a.g.hooks.fire('player.turn', { player: <Player>a });
                a.g.redraw();
            }

            a.spend(Sweep.movetimer);
        });

        return true;
    },
};