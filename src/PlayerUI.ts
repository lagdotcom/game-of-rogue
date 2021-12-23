import Game from './Game';
import { bonusText } from './tools';
import { ItemSlot } from './types';
import UIElement from './UIElement';

export default class PlayerUI implements UIElement {
    g: Game;
    width: number;
    x: number;
    y: number;

    constructor(g: Game, width: number = 20) {
        this.g = g;
        this.width = width;
        this.x = g.display.width - width;
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
        const psb = this.strBonus(false);
        const ssb = this.strBonus(true);
        this.stat(
            'Strength',
            `${f(p.str)} ${bonusText(psb)}${
                ssb !== null ? '/' + bonusText(ssb) : ''
            }`,
        );
        this.stat('Armour', `${f(p.armour)}`);

        this.y++;
        if (p.slotUsed(ItemSlot.Primary)) this.drawItem(ItemSlot.Primary);
        else if (p.slotUsed(ItemSlot.BothHands))
            this.drawItem(ItemSlot.BothHands);
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
        if (!this.g.player.slotUsed(sl)) {
            this.y++;
            return;
        }

        const i = this.g.player.equipment[sl];

        this.str('  ' + i.name(), 'silver');
        this.g.display.at(this.x, this.y - 1).set(i.token);
    }

    strBonus(secondary: boolean) {
        const p = this.g.player;

        if (secondary) {
            if (p.slotUsed(ItemSlot.Secondary))
                return p.equipment[ItemSlot.Secondary].template.strength;
            return null;
        }

        if (p.slotUsed(ItemSlot.Primary))
            return p.equipment[ItemSlot.Primary].template.strength;
        if (p.slotUsed(ItemSlot.BothHands))
            return p.equipment[ItemSlot.BothHands].template.strength;

        // TODO: monk barehand bonus
        return 0;
    }
}
