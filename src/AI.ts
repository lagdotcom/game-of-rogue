import { Actor } from './Actor';
import { attack } from './combat';
import { canSee, getVisibleEnemies } from './lights';
import { makePath } from './path';
import { getDirectionBetween, getDistanceBetween, oneOf } from './tools';
import { AIState, XY } from './types';

export function aiPassive(a: Actor) {
    if (ifHurtFaceAttacker(a)) return true;
    if (ifEnemyVisibleAnger(a)) return true;
    if (ifNoiseInEarshotInvestigate(a)) return true;

    return false;
}

export function aiInvestigating(a: Actor) {
    if (ifHurtFaceAttacker(a)) return true;
    if (ifEnemyVisibleAnger(a)) return true;
    // if (ifNoiseInEarshotInvestigate(a)) return true;
    if (ifReachedTargetGiveUp(a)) return true;

    if (approach(a, a.targetPos)) return true;

    // TODO couldn't reach noise point, give up
    return passive(a);
}

export function aiAngry(a: Actor) {
    if (ifTargetInvalidGiveUp(a)) return true;
    if (ifTargetGoneInvestigate(a)) return true;
    if (ifTargetInRangeAttack(a)) return true;

    return approach(a, a.target.pos);
}

function anger(a: Actor, target: Actor) {
    a.target = target;
    a.aiState = AIState.Angry;
    return aiAngry(a);
}

function investigate(a: Actor, pos: XY) {
    a.targetPos = pos;
    a.aiState = AIState.Investigating;
    return aiInvestigating(a);
}

function passive(a: Actor) {
    a.target = undefined;
    a.targetPos = undefined;
    a.aiState = AIState.Passive;
    return true;
}

function ifHurtFaceAttacker(a: Actor) {
    if (a.aiHurtBy) {
        const attacker = a.aiHurtBy;
        a.aiHurtBy = undefined;

        if (canSee(a, attacker.pos)) return anger(a, attacker);

        const dir = getDirectionBetween(a.pos, attacker.pos);
        if (dir !== a.facing) return a.turn(dir, true);

        // TODO we're facing them but can't see them?
    }

    return false;
}

function ifEnemyVisibleAnger(a: Actor) {
    const enemies = getVisibleEnemies(a);
    if (enemies.length) return anger(a, oneOf(a.g.rng, enemies));

    return false;
}

function ifNoiseInEarshotInvestigate(a: Actor) {
    if (!a.aiTraits.investigatesNoises) return false;

    const noise = a.g.noise.closest(a);
    if (noise) return investigate(a, noise.pos);

    return false;
}

function ifTargetInvalidGiveUp(a: Actor) {
    const target = a.target;
    if (!target) return passive(a);

    if (target.dead) return passive(a);
    if (target.side === a.side) return passive(a);

    return false;
}

function ifTargetGoneInvestigate(a: Actor) {
    const target = a.target;
    if (!target) return passive(a);

    if (!canSee(a, target.pos)) return investigate(a, target.pos);

    return false;
}

function ifTargetInRangeAttack(a: Actor) {
    const target = a.target;
    if (!target) return passive(a);

    const dx = Math.abs(a.pos.x - target.pos.x);
    const dy = Math.abs(a.pos.y - target.pos.y);
    if (dx > 1 || dy > 1) return false;

    const dir = getDirectionBetween(a.pos, target.pos);
    if (dir !== a.facing) return a.turn(dir, true);

    return attack(a, target);
}

function ifReachedTargetGiveUp(a: Actor) {
    const pos = a.targetPos;
    if (!pos) return passive(a);

    if (getDistanceBetween(a.pos, pos) === 0) return passive(a);

    return false;
}

function approach(a: Actor, pos: XY) {
    const path = makePath(a.g.f, a.pos, pos);
    if (!path) return false;

    const next = path[1];
    const dir = getDirectionBetween(a.pos, next);
    if (dir !== a.facing) return a.turn(dir, true);

    return a.move(next, true);
}
