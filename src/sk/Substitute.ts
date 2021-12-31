import { Actor } from '../Actor';
import Game from '../Game';
import { getSightCone } from '../lights';
import { Skill } from '../Skill';
import { isBlocked, oneOf } from '../tools';
import { AIState } from '../types';

export const Substitute: Skill = {
    name: 'Substitute',
    balance: 10,
    ki: 3,
    moveTimer: 0.1,
    fn: (a) => {
        if (a.substituteActive) {
            if (a.isPlayer)
                a.g.log.error('You already have a substitute ready.');
            return false;
        }

        const duration = a.skillsMastered.includes(Substitute.name) ? 7 : 2;
        a.ki -= Substitute.ki;
        a.balance -= Substitute.balance;

        if (a.isPlayer) a.g.log.info('You ready a substitute.');

        a.substituteActive = true;
        a.substituteTimer = a.g.timer + duration;

        a.spend(Substitute.moveTimer);
        return true;
    },
};

export function expireSubstitute(g: Game) {
    g.actors.forEach((a) => {
        if (!a.substituteActive) return;

        if (a.substituteTimer <= a.g.timer) {
            a.substituteActive = false;
            if (a.isPlayer) a.g.log.info('Your substitute is no longer ready.');
        }
    });
}

export function applyNinjaSubstitute(v: Actor, a: Actor) {
    const g = v.g;
    v.substituteActive = false;

    if (v.isPlayer) g.log.info('%an hits your substitute!', a);
    else if (a.isPlayer) g.log.info('You strike cleanly, but you hit a decoy!');
    else g.log.info('%an hits a decoy of %bn!', a, v);

    const range = v.skillsMastered.includes(Substitute.name) ? 5 : 3;
    const possible = g.f.map
        .square(v.pos, range)
        .filter((p) => !isBlocked(g, p));

    if (possible.length) {
        const cone = getSightCone(a);
        const choices = possible.filter((pos) => !cone.has(pos));
        if (choices.length) {
            const from = v.pos;
            v.pos = oneOf(g.rng, choices);

            if (a.target === v) {
                a.aiState = AIState.Passive;
                a.target = undefined;
            }

            if (v.isPlayer) {
                g.log.info('You teleport to relative safety.');
                g.hooks.fire('player.move', { actor: v, from });
            }
        }
    }
}
