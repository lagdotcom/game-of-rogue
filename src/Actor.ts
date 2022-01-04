import { Class } from './Class';
import Game from './Game';
import Item, { Equipment, isArmour, isWeapon, WeaponTemplate } from './Item';
import { isDefined } from './tools';
import {
    AIState,
    AITraits,
    Dir,
    ItemSlot,
    ModKey,
    Side,
    Tile,
    XY,
} from './types';

export abstract class Actor {
    aiHurtBy?: Actor;
    aiState: AIState;
    aiTraits: AITraits;
    balance: number;
    base: Record<ModKey, number>;
    bg: string;
    char: string;
    cloneOf?: Actor;
    dead: boolean;
    equipment: Equipment;
    facing: Dir;
    fg: string;
    hp: number;
    inventory: Item[];
    isActor: true;
    isEnemy?: true;
    isPlayer?: true;
    ki: number;
    lifetime: number;
    natural?: Item<WeaponTemplate>;
    natural2?: Item<WeaponTemplate>;
    nextMove: number;
    pos: XY;
    skills: string[];
    skillsMastered: string[];
    substituteActive: boolean;
    substituteTimer: number;
    target?: Actor;
    targetPos?: XY;
    turnCost: number;

    constructor(public g: Game, public name: string, public side: Side) {
        this.g = g;
        this.aiState = AIState.Passive;
        this.aiTraits = {};
        this.base = {
            armour: 0,
            balanceMax: 100,
            balanceRegen: 1,
            hearingRange: 10,
            hpRegen: 0.01,
            hpMax: 0,
            kiRegen: 0.1,
            kiMax: 0,
            moveCost: 1,
            moveTimer: 0,
            power: 0,
            sightFov: 160,
            sightRange: 5,
            strength: 0,
            weight: 0,
        };
        this.bg = 'red';
        this.balance = this.base.balanceMax;
        this.char = '?';
        this.dead = false;
        this.equipment = {};
        this.facing = Dir.N;
        this.fg = 'yellow';
        this.hp = 1;
        this.inventory = [];
        this.isActor = true;
        this.ki = 0;
        this.lifetime = Infinity;
        this.name = name;
        this.nextMove = 0;
        this.pos = { x: -1, y: -1 };
        this.skills = [];
        this.skillsMastered = [];
        this.substituteActive = false;
        this.substituteTimer = 0;
        this.turnCost = 0.5;
    }

    get alive() {
        return !this.dead;
    }

    get armour() {
        return this.stat('armour');
    }
    get balanceMax() {
        return this.stat('balanceMax');
    }
    get balanceRegen() {
        return this.stat('balanceRegen');
    }
    get hearingRange() {
        return this.stat('hearingRange');
    }
    get hpMax() {
        return this.stat('hpMax');
    }
    get hpRegen() {
        return this.stat('hpRegen');
    }
    get kiMax() {
        return this.stat('kiMax');
    }
    get kiRegen() {
        return this.stat('kiRegen');
    }
    get moveCost() {
        return this.stat('moveCost');
    }
    get sightFov() {
        return this.stat('sightFov');
    }
    get sightRange() {
        return this.stat('sightRange');
    }
    get strength() {
        return this.stat('strength');
    }

    get maxCarriedWeight() {
        return this.strength * 3;
    }

    get equippedItems() {
        return Object.values(this.equipment).filter(isDefined);
    }

    get carriedWeight() {
        return this.inventory
            .concat(this.equippedItems)
            .reduce((total, i) => total + i.totalWeight, 0);
    }

    stat(k: ModKey): number {
        let base = this.base[k];
        this.equippedItems.forEach((item) => (base += item.stat(k)));

        return base;
    }

    apply(cl: Class) {
        this.hp = this.base.hpMax = cl.hp;
        this.ki = this.base.kiMax = cl.ki;
        this.base.strength = cl.str;
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
        this.g.t.enter('Actor.equip', this.name, i.template.name);

        if (isWeapon(i)) {
            if (i.template.hands === 0 && i.template.ammo) {
                let w: Item<WeaponTemplate>;

                if (!this.equipment.both) {
                    if (!this.equipment.primary) {
                        if (this.isPlayer)
                            this.g.log.info('Equip the weapon first.');

                        this.g.t.message(
                            'cannot equip ammo; no weapon equipped',
                        );
                        this.g.t.leave('Actor.equip');
                        return false;
                    }

                    w = this.equipment.primary;
                } else w = this.equipment.both;

                if (i.template.firedBy && !w.matches(i.template.firedBy)) {
                    if (this.isPlayer)
                        this.g.log.info(`${w.name()} can't fire ${i.name()}`);

                    this.g.t.message(
                        'cannot equip ammo; wrong weapon equipped',
                    );
                    this.g.t.leave('Actor.equip');
                    return false;
                }

                const result = this.equipApply(i, ItemSlot.Secondary);
                this.g.t.leave('Actor.equip');
                return result;
            }

            if (i.template.hands === 2) {
                if (this.equipment.both) {
                    if (!this.unEquip(ItemSlot.BothHands)) {
                        this.g.t.message('cannot remove BothHand');
                        this.g.t.leave('Actor.equip');

                        return false;
                    }
                }

                if (this.equipment.secondary) {
                    if (!this.unEquip(ItemSlot.Secondary)) {
                        this.g.t.message('cannot remove Secondary');
                        this.g.t.leave('Actor.equip');
                        return false;
                    }
                }

                if (this.equipment.primary) {
                    if (!this.unEquip(ItemSlot.Primary)) {
                        this.g.t.message('cannot remove Primary');
                        this.g.t.leave('Actor.equip');
                        return false;
                    }
                }

                const result = this.equipApply(i, ItemSlot.BothHands);
                this.g.t.leave('Actor.equip');
                return result;
            }

            if (this.equipment.both) {
                if (!this.unEquip(ItemSlot.BothHands)) {
                    this.g.t.message('cannot remove BothHands');
                    this.g.t.leave('Actor.equip');
                    return false;
                }
            }

            if (i.template.offhand) {
                if (this.equipment.primary) {
                    if (this.equipment.secondary) {
                        if (!this.unEquip(ItemSlot.Secondary)) {
                            this.g.t.message('cannot remove Secondary');
                            this.g.t.leave('Actor.equip');
                            return false;
                        }
                    }

                    const result = this.equipApply(i, ItemSlot.Secondary);
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

            const result = this.equipApply(i, ItemSlot.Primary);
            this.g.t.leave('Actor.equip');
            return result;
        } else if (isArmour(i)) {
            if (!this.unEquip(i.template.slot)) {
                this.g.t.message('cannot remove', i.template.slot);
                this.g.t.leave('Actor.equip');
                return false;
            }

            const result = this.equipApply(i, i.template.slot);
            this.g.t.leave('Actor.equip');
            return result;
        }

        return false;
    }

    equipApply<T extends keyof Equipment>(i: Equipment[T], sl: T) {
        this.equipment[sl] = i;
        this.inventory = this.inventory.filter((x) => x !== i);

        return true;
    }

    unEquip(sl: ItemSlot) {
        if (!this.equipment[sl]) return true;
        this.g.t.message('Actor.unEquip', this.name, sl);

        return this.unEquipApply(sl);
    }

    unEquipApply(sl: ItemSlot) {
        const i = this.equipment[sl];
        if (i) {
            this.inventory.push(i);
            delete this.equipment[sl];
        }
        return true;
    }

    ai() {
        return false;
    }

    getPrimaryWeapon() {
        const both = this.equipment.both;
        if (both) return both;

        const primary = this.equipment.primary;
        if (primary) return primary;

        return this.natural;
    }

    getSecondaryWeapon() {
        const secondary = this.equipment.secondary;
        if (secondary) return secondary;

        return this.natural2;
    }
}
