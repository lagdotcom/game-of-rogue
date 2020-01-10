import { XY } from './types';
import { int } from './tools';

interface GridRef extends XY {
    g: Grid;
    s: Symbol;
}

export class Grid {
    contents: string[][];
    default: string;
    name?: string;
    height: number;
    oob: GridRef;
    refs: GridRef[][];
    width: number;

    constructor(
        name: string,
        width: number,
        height: number,
        init: string = '',
    ) {
        this.name = name;
        this.height = height;
        this.width = width;
        this.default = init;

        this.contents = [];
        this.oob = { x: -1, y: -1, g: this, s: Symbol(`${name}@oob`) };
        this.refs = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            let rrow = [];
            for (let x = 0; x < width; x++) {
                row.push(init);
                rrow.push({ x, y, g: this, s: Symbol(`${name}@${x},${y}`) });
            }

            this.contents.push(row);
            this.refs.push(rrow);
        }
    }

    contains(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    ref(x: number, y: number) {
        let rx = int(x),
            ry = int(y);
        return this.contains(rx, ry) ? this.refs[ry][rx] : this.oob;
    }

    get(x: number, y: number) {
        let rx = int(x),
            ry = int(y);
        return this.contains(rx, ry) ? this.contents[ry][rx] : this.default;
    }

    set(x: number, y: number, value: string) {
        let rx = int(x),
            ry = int(y);
        this.contents[ry][rx] = value;
    }

    paste(sx: number, sy: number, g: Grid, ignore: string = '') {
        for (let y = 0; y < g.height; y++) {
            if (sy + y >= this.height) continue;

            for (let x = 0; x < g.width; x++) {
                if (sx + x >= this.width) continue;
                let t = g.get(x, y);

                if (t !== ignore) this.set(sx + x, sy + y, g.get(x, y));
            }
        }
    }

    find(...values: string[]) {
        let points: GridRef[] = [];
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                if (values.includes(this.get(x, y)))
                    points.push(this.refs[y][x]);
        return points;
    }

    rotate(turns: number) {
        let { width, height } = this;
        let r: Grid;
        if (!turns) return this;

        let name = `${this.name}/${turns}`;
        if (turns == 2) r = new Grid(name, width, height);
        else r = new Grid(name, height, width);

        for (let y = 0; y < height; y++)
            for (let x = 0; x < width; x++) {
                let dx: number, dy: number;

                switch (turns) {
                    case 1:
                        dx = height - 1 - y;
                        dy = x;
                        break;

                    case 2:
                        dx = width - 1 - x;
                        dy = height - 1 - y;
                        break;

                    case 3:
                        dx = y;
                        dy = width - 1 - x;
                        break;
                }

                r.set(dx, dy, this.get(x, y));
            }

        return r;
    }

    replace(f: string, t: string) {
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                if (this.get(x, y) == f) this.set(x, y, t);
    }

    toString() {
        return this.contents.map(x => x.join('')).join('\n');
    }
}
