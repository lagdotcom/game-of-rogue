import { dirOffsets } from './constants';
import { int } from './tools';
import { Dir, XY } from './types';

interface GridRef<T> extends XY {
    g: Grid<T>;
    s: symbol;
}

export class Grid<T = string> {
    contents: T[][];
    oob: GridRef<T>;
    refs: GridRef<T>[][];

    constructor(
        public name: string,
        public width: number,
        public height: number,
        public init: T,
    ) {
        this.contents = [];
        this.oob = { x: -1, y: -1, g: this, s: Symbol(`${name}@oob`) };
        this.refs = [];
        for (let y = 0; y < height; y++) {
            const row: T[] = [];
            const refRow: GridRef<T>[] = [];
            for (let x = 0; x < width; x++) {
                row.push(init);
                refRow.push({ x, y, g: this, s: Symbol(`${name}@${x},${y}`) });
            }

            this.contents.push(row);
            this.refs.push(refRow);
        }
    }

    contains(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    ref(x: number, y: number) {
        const rx = int(x),
            ry = int(y);
        return this.contains(rx, ry) ? this.refs[ry][rx] : this.oob;
    }

    addFacing(ref: XY, facing: Dir) {
        const offset = dirOffsets[facing];
        return this.ref(ref.x + offset.x, ref.y + offset.y);
    }

    get(x: number, y: number) {
        const rx = int(x),
            ry = int(y);
        return this.contains(rx, ry) ? this.contents[ry][rx] : this.init;
    }

    set(x: number, y: number, value: T) {
        const rx = int(x),
            ry = int(y);
        this.contents[ry][rx] = value;
    }

    paste(sx: number, sy: number, g: Grid<T>, ignore: T) {
        for (let y = 0; y < g.height; y++) {
            if (sy + y >= this.height) continue;

            for (let x = 0; x < g.width; x++) {
                if (sx + x >= this.width) continue;
                const t = g.get(x, y);

                if (t !== ignore) this.set(sx + x, sy + y, g.get(x, y));
            }
        }
    }

    find(...values: T[]) {
        const points: GridRef<T>[] = [];
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                if (values.includes(this.get(x, y)))
                    points.push(this.refs[y][x]);
        return points;
    }

    square(centre: XY, range: number): GridRef<T>[] {
        const sx = Math.max(0, centre.x - range);
        const sy = Math.max(0, centre.y - range);
        const ex = Math.min(this.width - 1, centre.x + range);
        const ey = Math.min(this.height - 1, centre.y + range);

        const refs = [];
        for (let y = sy; y <= ey; y++) {
            for (let x = sx; x <= ex; x++) {
                refs.push(this.ref(x, y));
            }
        }
        return refs;
    }

    rotate(turns: 0 | 1 | 2 | 3) {
        const { width, height, init } = this;
        let r: Grid<T>;
        if (!turns) return this;

        const name = `${this.name}/${turns}`;
        if (turns === 2) r = new Grid(name, width, height, init);
        else r = new Grid(name, height, width, init);

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

    replace(f: T, t: T) {
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                if (this.get(x, y) === f) this.set(x, y, t);
    }

    toString() {
        return this.contents.map((x) => x.join('')).join('\n');
    }
}
