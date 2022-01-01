import Game from './Game';
import { bonusText } from './tools';
import { ItemSlot } from './types';
import UIElement from './UIElement';

export default class PlayerUI implements UIElement {
    x: number;
    y: number;

    constructor(public g: Game, public width: number = 20) {
        this.x = g.display.width - width;
        this.y = 0;
    }

    draw() {
        const p = this.g.player;
        const f = Math.floor;

        this.y = 0;
        this.str(p.name, 'silver');
        this.str(`${p.class.name}, Level ${p.level}`, 'silver');

        this.y++;
        this.stat('HP', `${f(p.hp)} / ${f(p.hpMax)}`);
        this.stat('Ki', `${f(p.ki)} / ${f(p.kiMax)}`);
        this.stat('Balance', `${f(p.balance)}%`);

        this.y++;
        const psb = <number>this.powerModifier(false);
        const ssb = this.powerModifier(true);
        this.stat(
            'Strength',
            `${f(p.strength)} ${bonusText(psb)}${
                ssb !== null ? '/' + bonusText(ssb) : ''
            }`,
        );
        this.stat('Armour', `${f(p.armour)}`);

        this.y++;
        if (p.equipment.primary) this.drawItem(ItemSlot.Primary);
        else if (p.equipment.both) this.drawItem(ItemSlot.BothHands);
        else this.y++;

        this.drawItem(ItemSlot.Secondary);
        this.drawItem(ItemSlot.Body);
        this.drawItem(ItemSlot.Head);
    }

    str(s: string, fg: string, bg?: string) {
        this.g.display.str(this.x, this.y++, s, fg, bg);
    }

    stat(name: string, val: string) {
        this.g.display.str(this.x, this.y, name + ':', 'silver');
        this.g.display.str(this.x + name.length + 2, this.y++, val, 'white');
    }

    drawItem(sl: ItemSlot) {
        const i = this.g.player.equipment[sl];
        if (!i) {
            this.y++;
            return;
        }

        this.str('  ' + i.name(), 'silver');
        this.g.display.at(this.x, this.y - 1).set(i.token);
    }

    powerModifier(secondary: boolean) {
        const p = this.g.player;

        if (secondary) {
            if (p.equipment.secondary) return p.equipment.secondary.power;
            return null;
        }

        if (p.equipment.primary) return p.equipment.primary.power;
        if (p.equipment.both) return p.equipment.both.power;

        // TODO: monk barehand bonus
        return 0;
    }
}
