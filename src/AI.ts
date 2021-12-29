import { Actor } from './Actor';
import { attack } from './combat';
import { getSightCone } from './lights';
import { makePath } from './path';
import { getDirectionBetween, getDistanceBetween, oneOf } from './tools';
import { XY } from './types';

export function aiChase(a: Actor) {
    const hate = a.g.getNearestEnemy(a);
    if (hate) aiMove(a, hate.pos);
}

export function aiStand(a: Actor) {
    const hate = getVisibleEnemy(a);
    if (hate) {
        a.alerted = true;
        a.target = hate;
        return false;
    }

    if (a.investigating) {
        const noise = a.investigating;
        if (
            getDistanceBetween(a.pos, noise) === 0 ||
            a.investigationTimer < a.g.timer
        ) {
            a.investigating = undefined;
            a.g.t.message(a.name, 'stopped investigating a noise.');

            // TODO: turn around in place??
            return false;
        }

        aiMove(a, noise);
        return true;
    }

    const noise = a.g.noise.closest(a);
    if (!noise) return false;

    if (!a.investigatesNoises) {
        const dir = getDirectionBetween(a.pos, noise.pos);
        a.turn(dir, true);
        a.g.t.message(a.name, 'turns towards a noise.');
        return true;
    }

    // TODO
    const timer = getDistanceBetween(a.pos, noise.pos) + 3;
    a.investigating = noise.pos;
    a.investigationTimer = a.g.timer + timer;
    a.g.t.message(a.name, 'is investigating a noise for', timer, 'turns.');
    aiMove(a, noise.pos);
}

export function getVisibleEnemy(a: Actor): Actor | undefined {
    const sight = getSightCone(a);
    const enemies = a.g.actors.filter(
        (x) => x.side !== a.side && sight.has(x.pos),
    );
    if (enemies.length) return oneOf(a.g.rng, enemies);
}

export function aiMove(a: Actor, pos: XY) {
    const blockers = a.g.blockers(pos);
    const v = blockers.find((b) => b.isPlayer);
    if (v && getDistanceBetween(a.pos, pos) === 1) {
        const dir = getDirectionBetween(a.pos, pos);

        if (dir !== a.facing) return a.turn(dir, true);

        attack(a, v);
        return false;
    }

    const path = makePath(a.g.f, a.pos, pos);
    if (!path || path.length < 2) return false;

    const next = path[1];
    const dir = getDirectionBetween(next, a.pos);
    if (dir !== a.facing) return a.turn(dir, true);

    a.move(next, true);
}

export function clearDeadTarget(a: Actor) {
    if (a.target?.dead) {
        a.alerted = false;
        a.target = undefined;
        return true;
    }

    if (a.target?.side === a.side) {
        a.alerted = false;
        a.target = undefined;
        return true;
    }
}

export function canUseMissile(a: Actor) {
    // TODO
    return false;
}
