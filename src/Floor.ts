import { Grid } from './grid';
import Enemy from './Enemy';
import Item from './Item';
import { Tile } from './types';
import Point from './Point';

export class Floor {
    enemies: Enemy[];
    items: Item[];
    map: Grid;
    player: Point;

    constructor(width: number, height: number) {
        this.map = new Grid(width, height, Tile.Empty);
        this.enemies = [];
        this.items = [];
        this.player = null;
    }

    enemyAt(p: Point) {
        let enemies = this.enemies.filter(e => p.equals(e.pos));
        return enemies.length ? enemies[0] : null;
    }

    itemAt(p: Point) {
        let items = this.items.filter(i => p.equals(i.pos));
        return items.length ? items[0] : null;
    }
}
