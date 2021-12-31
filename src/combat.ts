import { Actor } from './Actor';
import { colourDeath } from './colours';
import { STRENGTH_RATIO } from './constants';
import { Weapon } from './Item';
import { applyNinjaSubstitute } from './sk/Substitute';
import { getCardinalAngleBetween, getCardinalDirectionBetween } from './tools';
import { AIState } from './types';

const StrikeWasSubstituted = -100;

export function kill(attacker: Actor, victim: Actor) {
    const g = attacker.g;
    victim.dead = true;
    victim.target = undefined;
    victim.targetPos = undefined;

    if (victim.isPlayer) {
        g.log.coloured(colourDeath, 'You died!');
        g.hooks.fire('player.died', { attacker, victim });
    } else {
        if (victim.cloneOf) {
            g.log.coloured(
                colourDeath,
                '%an vanishes with a puff of smoke!',
                victim,
            );
        } else {
            if (victim.aiState === AIState.Angry) {
                g.log.coloured(colourDeath, '%an screams as they die!', victim);
                g.noise.add(victim.pos, 8, victim, 2);
            } else {
                g.log.coloured(
                    colourDeath,
                    '%an falls to the ground, dead!',
                    victim,
                );
            }
        }

        g.hooks.fire('enemy.died', { attacker, victim });
    }

    // TOOD: drop items
    g.remove(victim);
}

export function damage(attacker: Actor, victim: Actor, dmg: number) {
    victim.hp -= dmg;
    // TODO: on_attack triggers
    // TODO: on_hit triggers

    if (victim.isPlayer)
        attacker.g.hooks.fire('player.hit', { attacker, victim });
    else attacker.g.hooks.fire('enemy.hit', { attacker, victim });

    if (victim.hp < 1) {
        kill(attacker, victim);
        return false;
    }

    return true;
}

function applyArmour(a: Actor, v: Actor, dmg: number) {
    const dir = getCardinalDirectionBetween(v.pos, a.pos);
    const ang = getCardinalAngleBetween(dir, v.facing);

    let absorb = v.armour;
    if (ang === 1) absorb *= 0.75;
    else if (ang === 0) absorb *= 0.25;

    if (absorb > dmg) return 0;
    return Math.floor(dmg - absorb);
}

function strike(a: Actor, v: Actor, w: Weapon): number {
    if (v.dead) return 0;

    if (v.substituteActive) {
        applyNinjaSubstitute(v, a);
        return StrikeWasSubstituted;
    }

    let dmg = a.str / STRENGTH_RATIO + w.template.strength;
    dmg = applyArmour(a, v, dmg);
    a.g.log.info('%ao %cn hits %bn for %d#.', a, v, w, dmg);

    if (dmg > 0) damage(a, v, dmg);
    return dmg;
}

export function attack(a: Actor, v: Actor): boolean {
    // a.g.t.todo('attack', a, v);

    let totalDamage = 0;
    let balanceCost = 0;
    let timerCost = 0;
    let substituted = false;

    const primary = a.getPrimaryWeapon();
    if (primary) {
        const dmg = strike(a, v, primary);
        if (dmg === StrikeWasSubstituted) substituted = true;
        else totalDamage += dmg;

        balanceCost += primary.template.weight || 0;
        timerCost += primary.template.moveTimer;
    }

    if (!substituted) {
        const secondary = a.getSecondaryWeapon();
        if (secondary && !secondary.template.ammo && v.alive) {
            totalDamage += strike(a, v, secondary);
            balanceCost += secondary.template.weight || 0;
            timerCost += secondary.template.moveTimer;
        }
    }

    a.balance -= balanceCost;

    combatAlert(a, v);
    a.spend(timerCost);
    a.g.redraw();
    return true;
}

export function combatAlert(a: Actor, v: Actor) {
    if (v.isEnemy) v.aiHurtBy = a;
}
