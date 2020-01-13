import { Dir, XY, Tile, ItemType, ItemSlot } from './types';
import Game from './Game';
import Item, { Equipment, Weapon, Armour } from './Item';

export abstract class Actor {
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
    g: Game;
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
    name: string;
    nextmove: number;
    pos: XY;
    sightFov: number;
    sightRange: number;
    str: number;
    turnCost: number;

    constructor(g: Game, name: string) {
        this.g = g;
        this.armour = 0;
        this.balance = this.balanceMax = 100;
        this.balanceRegen = 1;
        this.dead = false;
        this.equipment = {};
        this.hpRegen = 0.01;
        this.inventory = [];
        this.kiRegen = 0.1;
        this.name = name;
        this.nextmove = 0;
        this.moveCost = 1;
        this.sightFov = 160;
        this.sightRange = 5;
        this.turnCost = 0.5;
    }

    move(dest: XY, spend: boolean) {
        if (this.g.f.map.get(dest.x, dest.y) == Tile.Wall) return false;
        if (this.g.actors.filter(a => a.pos == dest).length) return false;

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
        if (this.facing == d) return false;

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
        this.nextmove += t;
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
        if (i.type == ItemType.Other) return false;
        this.g.t.enter('Actor.equip', this.name, i.template.name);

        if (i.type == ItemType.Weapon) {
            const wi = <Weapon>i;
            if (wi.template.hands == 0 && wi.template.ammo) {
                let w: Weapon;

                if (!this.slotused(ItemSlot.BothHands)) {
                    if (!this.slotused(ItemSlot.Primary)) {
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

            if (wi.template.hands == 2) {
                if (this.slotused(ItemSlot.BothHands)) {
                    if (!this.unequip(ItemSlot.BothHands)) {
                        this.g.t.message('cannot remove BothHand');
                        this.g.t.leave('Actor.equip');

                        return false;
                    }
                }

                if (this.slotused(ItemSlot.Secondary)) {
                    if (!this.unequip(ItemSlot.Secondary)) {
                        this.g.t.message('cannot remove Secondary');
                        this.g.t.leave('Actor.equip');
                        return false;
                    }
                }

                if (this.slotused(ItemSlot.Primary)) {
                    if (!this.unequip(ItemSlot.Primary)) {
                        this.g.t.message('cannot remove Primary');
                        this.g.t.leave('Actor.equip');
                        return false;
                    }
                }

                const result = this.equipApply(wi, ItemSlot.BothHands);
                this.g.t.leave('Actor.equip');
                return result;
            }

            if (this.slotused(ItemSlot.BothHands)) {
                if (!this.unequip(ItemSlot.BothHands)) {
                    this.g.t.message('cannot remove BothHands');
                    this.g.t.leave('Actor.equip');
                    return false;
                }
            }

            if (wi.template.offhand) {
                if (this.slotused(ItemSlot.Primary)) {
                    if (this.slotused(ItemSlot.Secondary)) {
                        if (!this.unequip(ItemSlot.Secondary)) {
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

            if (!this.unequip(ItemSlot.Primary)) {
                this.g.t.message('cannot remove Primary');
                this.g.t.leave('Actor.equip');
                return false;
            }

            const result = this.equipApply(wi, ItemSlot.Primary);
            this.g.t.leave('Actor.equip');
            return result;
        }

        if (!this.unequip(i.template.slot)) {
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
        this.inventory = this.inventory.filter(x => x != i);

        Object.entries(i.mods).forEach(p => {
            this[p[0]] += p[1];
        });
    }

    unequip(sl: ItemSlot) {
        if (!this.equipment[sl]) return true;
        this.g.t.message('Actor.unequip', this.name, sl);

        return this.unequipApply(sl);
    }

    unequipApply(sl: ItemSlot) {
        let i = this.equipment[sl];
        this.inventory.push(i);
        delete this.equipment[sl];

        Object.entries(i.mods).forEach(p => {
            this[p[0]] -= p[1];
        });

        return true;
    }

    slotused(sl: ItemSlot) {
        return !!this.equipment[sl];
    }

    ai() {
        this.g.t.todo('Actor.ai', this.name);
        return false;
    }
}
