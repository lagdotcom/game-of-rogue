import { Grid } from './Grid';
import Enemy from './Enemy';
import Item from './Item';
import { Tile, XY } from './types';

export class Floor {
    enemies: Enemy[];
    items: Item[];
    map: Grid;
    player: XY;

    constructor(name: string, width: number, height: number) {
        this.map = new Grid(name, width, height, Tile.Empty);
        this.enemies = [];
        this.items = [];
        this.player = null;
    }

    enemyAt(p: XY) {
        let enemies = this.enemies.filter(e => e.pos == p);
        return enemies.length ? enemies[0] : null;
    }

    itemAt(p: XY) {
        let items = this.items.filter(i => i.pos == p);
        return items.length ? items[0] : null;
    }
}
