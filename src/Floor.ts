import Enemy from './Enemy';
import { Grid } from './Grid';
import Item from './Item';
import { Tile, XY } from './types';

export class Floor {
    enemies: Enemy[];
    items: Item[];
    map: Grid;
    player: XY;

    constructor(
        public name: string,
        public floor: number,
        public width: number,
        public height: number,
    ) {
        this.map = new Grid(name, width, height, Tile.Empty);
        this.enemies = [];
        this.items = [];

        this.player = this.map.oob;
    }

    enemyAt(p: XY) {
        const enemies = this.enemies.filter((e) => e.pos === p);
        return enemies.length ? enemies[0] : undefined;
    }

    itemAt(p: XY) {
        const items = this.items.filter((i) => i.pos === p);
        return items.length ? items[0] : undefined;
    }
}
