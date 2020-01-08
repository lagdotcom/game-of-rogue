import Point from './Point';

export class Grid {
    contents: string[][];
    default: string;
    name?: string;
    height: number;
    width: number;

    constructor(width: number, height: number, init: string = '') {
        this.height = height;
        this.width = width;
        this.default = init;

        this.contents = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) row.push(init);

            this.contents.push(row);
        }
    }

    contains(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    get(x: number, y: number) {
        return this.contains(x, y) ? this.contents[y][x] : this.default;
    }

    set(x: number, y: number, value: string) {
        this.contents[y][x] = value;
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
        let points: Point[] = [];
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                if (values.includes(this.get(x, y)))
                    points.push(new Point(x, y));
        return points;
    }

    rotate(turns: number) {
        let { width, height } = this;
        let r: Grid;
        if (!turns) return this;

        if (turns == 2) r = new Grid(width, height);
        else r = new Grid(height, width);

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

        r.name = `${this.name}/${turns}`;
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
