import { aiAngry, aiInvestigating, aiPassive } from './AI';
import { Class } from './Class';
import Game from './Game';
import Item, { Armour, Equipment, Weapon } from './Item';
import {
    AIState,
    AITraits,
    Dir,
    ItemSlot,
    ItemType,
    Side,
    Tile,
    XY,
} from './types';

export abstract class Actor {
    aiHurtBy?: Actor;
    aiState: AIState;
    aiTraits: AITraits;
    armour: number;
    balance: number;
    balanceMax: number;
    balanceRegen: number;
    bg: string;
    char: string;
    cloneOf?: Actor;
    dead: boolean;
    equipment: Equipment;
    facing: Dir;
    fg: string;
    hearingRange: number;
    hp: number;
    hpMax: number;
    hpRegen: number;
    inventory: Item[];
    isEnemy?: true;
    isPlayer?: true;
    ki: number;
    kiMax: number;
    kiRegen: number;
    moveCost: number;
    natural?: Weapon;
    natural2?: Weapon;
    nextMove: number;
    pos: XY;
    sightFov: number;
    sightRange: number;
    skills: string[];
    skillsMastered: string[];
    str: number;
    target?: Actor;
    targetPos?: XY;
    turnCost: number;

    constructor(public g: Game, public name: string, public side: Side) {
        this.g = g;
        this.aiState = AIState.Passive;
        this.aiTraits = {};
        this.armour = 0;
        this.balance = this.balanceMax = 100;
        this.balanceRegen = 1;
        this.dead = false;
        this.equipment = {};
        this.hearingRange = 10;
        this.hpRegen = 0.01;
        this.inventory = [];
        this.kiRegen = 0.1;
        this.name = name;
        this.nextMove = 0;
        this.moveCost = 1;
        this.sightFov = 160;
        this.sightRange = 5;
        this.skills = [];
        this.skillsMastered = [];
        this.turnCost = 0.5;
    }

    get alive() {
        return !this.dead;
    }

    apply(cl: Class) {
        this.hp = this.hpMax = cl.hp;
        this.ki = this.kiMax = cl.ki;
        this.str = cl.str;
    }

    move(dest: XY, spend: boolean) {
        if (this.g.f.map.get(dest.x, dest.y) === Tile.Wall) return false;
        if (this.g.actors.filter((a) => a.pos === dest).length) return false;

        const from = this.pos;
        this.pos = dest;
        if (this.isPlayer) {
            this.g.redraw();
            this.g.hooks.fire('player.move', { actor: this, from });
        }
        if (spend) this.spend(this.moveCost);
        return true;
    }

    turn(d: Dir, spend: boolean) {
        if (this.facing === d) return false;

        const from = this.facing;
        this.facing = d;
        if (this.isPlayer) {
            this.g.redraw();
            this.g.hooks.fire('player.turn', { actor: this, from });
        }
        if (spend) this.spend(this.turnCost);
        return true;
    }

    spend(t: number) {
        this.nextMove += t;
        if (this.isPlayer) this.g.advance(t);
    }

    regen(t: number) {
        if (this.dead) return;

        this.balance = Math.min(
            this.balanceMax,
            this.balance + this.balanceRegen * t,
        );
        this.ki = Math.min(this.kiMax, this.ki + this.kiRegen * t);
        this.hp = Math.min(this.hpMax, this.hp + this.hpRegen * t);
    }

    get(i: Item) {
        this.g.t.todo('Actor.get', this.name, i.template.name);

        this.inventory.push(i);
    }

    equip(i: Item) {
        if (i.type === ItemType.Other) return false;
        this.g.t.enter('Actor.equip', this.name, i.template.name);

        if (i.type === ItemType.Weapon) {
            const wi = <Weapon>i;
            if (wi.template.hands === 0 && wi.template.ammo) {
                let w: Weapon;

                if (!this.slotUsed(ItemSlot.BothHands)) {
                    if (!this.slotUsed(ItemSlot.Primary)) {
                        if (this.isPlayer)
                            this.g.log.info('Equip the weapon first.');

                        this.g.t.message(
                            'cannot equip ammo; no weapon equipped',
                        );
                        this.g.t.leave('Actor.equip');
                        return false;
                    }

                    w = this.equipment[ItemSlot.Primary];
                } else w = this.equipment[ItemSlot.BothHands];

                if (!w.matches(wi.template.firedBy)) {
                    if (this.isPlayer)
                        this.g.log.info(`${w.name()} can't fire ${wi.name()}`);

                    this.g.t.message(
                        'cannot equip ammo; wrong weapon equipped',
                    );
                    this.g.t.leave('Actor.equip');
                    return false;
                }

                const result = this.equipApply(wi, ItemSlot.Secondary);
                this.g.t.leave('Actor.equip');
                return result;
            }

            if (wi.template.hands === 2) {
                if (this.slotUsed(ItemSlot.BothHands)) {
                    if (!this.unEquip(ItemSlot.BothHands)) {
                        this.g.t.message('cannot remove BothHand');
                        this.g.t.leave('Actor.equip');

                        return false;
                    }
                }

                if (this.slotUsed(ItemSlot.Secondary)) {
                    if (!this.unEquip(ItemSlot.Secondary)) {
                        this.g.t.message('cannot remove Secondary');
                        this.g.t.leave('Actor.equip');
                        return false;
                    }
                }

                if (this.slotUsed(ItemSlot.Primary)) {
                    if (!this.unEquip(ItemSlot.Primary)) {
                        this.g.t.message('cannot remove Primary');
                        this.g.t.leave('Actor.equip');
                        return false;
                    }
                }

                const result = this.equipApply(wi, ItemSlot.BothHands);
                this.g.t.leave('Actor.equip');
                return result;
            }

            if (this.slotUsed(ItemSlot.BothHands)) {
                if (!this.unEquip(ItemSlot.BothHands)) {
                    this.g.t.message('cannot remove BothHands');
                    this.g.t.leave('Actor.equip');
                    return false;
                }
            }

            if (wi.template.offhand) {
                if (this.slotUsed(ItemSlot.Primary)) {
                    if (this.slotUsed(ItemSlot.Secondary)) {
                        if (!this.unEquip(ItemSlot.Secondary)) {
                            this.g.t.message('cannot remove Secondary');
                            this.g.t.leave('Actor.equip');
                            return false;
                        }
                    }

                    const result = this.equipApply(wi, ItemSlot.Secondary);
                    this.g.t.leave('Actor.equip');
                    return result;
                }

                // fall through to non-offhand weapon
            }

            if (!this.unEquip(ItemSlot.Primary)) {
                this.g.t.message('cannot remove Primary');
                this.g.t.leave('Actor.equip');
                return false;
            }

            const result = this.equipApply(wi, ItemSlot.Primary);
            this.g.t.leave('Actor.equip');
            return result;
        }

        if (!this.unEquip(i.template.slot)) {
            this.g.t.message('cannot remove', i.template.slot);
            this.g.t.leave('Actor.equip');
            return false;
        }

        const result = this.equipApply(<Armour>i, i.template.slot);
        this.g.t.leave('Actor.equip');
        return result;
    }

    equipApply<T extends keyof Equipment>(i: Equipment[T], sl: T) {
        this.equipment[sl] = i;
        this.inventory = this.inventory.filter((x) => x !== i);

        Object.entries(i.mods).forEach((p) => {
            this[p[0]] += p[1];
        });
    }

    unEquip(sl: ItemSlot) {
        if (!this.equipment[sl]) return true;
        this.g.t.message('Actor.unEquip', this.name, sl);

        return this.unEquipApply(sl);
    }

    unEquipApply(sl: ItemSlot) {
        const i = this.equipment[sl];
        this.inventory.push(i);
        delete this.equipment[sl];

        Object.entries(i.mods).forEach((p) => {
            this[p[0]] -= p[1];
        });

        return true;
    }

    slotUsed(sl: ItemSlot) {
        return !!this.equipment[sl];
    }

    ai() {
        switch (this.aiState) {
            case AIState.Passive:
                return aiPassive(this);
            case AIState.Investigating:
                return aiInvestigating(this);
            case AIState.Angry:
                return aiAngry(this);
            default:
                return false;
        }
    }

    getPrimaryWeapon() {
        if (this.slotUsed(ItemSlot.BothHands))
            return this.equipment[ItemSlot.BothHands];

        if (this.slotUsed(ItemSlot.Primary))
            return this.equipment[ItemSlot.Primary];

        return this.natural;
    }

    getSecondaryWeapon() {
        if (this.slotUsed(ItemSlot.Secondary))
            return this.equipment[ItemSlot.Secondary];

        return this.natural2;
    }
}
