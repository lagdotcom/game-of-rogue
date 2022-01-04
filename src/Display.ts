import { Token } from './types';

export class DisplayCell {
    f!: string;
    b!: string;
    bo!: string;
    value!: string;
    dirty: boolean;
    tx: number;
    ty: number;

    constructor(
        public parent: Display,
        public x: number,
        public y: number,
        public w: number,
        public h: number,
    ) {
        this.fg('white');
        this.bg('black');
        this.text(' ');
        this.border('transparent');

        this.dirty = false;
        this.tx = x + w / 2;
        this.ty = y + h / 2;
    }

    set(tok: Token) {
        this.fg(tok.fg);
        this.bg(tok.bg);
        this.text(tok.char);
        // this.border('transparent');
    }

    fg(colour?: string) {
        if (colour !== undefined && this.f !== colour) {
            this.dirty = true;
            this.f = colour;
        }
        return this.f;
    }

    bg(colour?: string) {
        if (colour !== undefined && this.b !== colour) {
            this.dirty = true;
            this.b = colour;
        }
        return this.b;
    }

    border(colour?: string) {
        if (colour !== undefined && this.bo !== colour) {
            this.dirty = true;
            this.bo = colour;
        }
        return this.bo;
    }

    text(text?: string) {
        if (text !== undefined) {
            this.dirty = true;
            this.value = text;
        }
        return this.value;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.dirty) {
            this.dirty = false;

            ctx.fillStyle = this.b;
            ctx.fillRect(this.x, this.y, this.w, this.h);

            ctx.strokeStyle = this.f;
            ctx.strokeText(this.value, this.tx, this.ty);

            if (this.bo !== 'transparent') {
                ctx.strokeStyle = this.bo;
                ctx.strokeRect(this.x, this.y, this.w, this.h);
            }
        }
    }
}

export class Display {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cells: DisplayCell[];
    defaultBackground: string;
    defaultForeground: string;

    constructor(
        public parent: HTMLElement,
        public width: number,
        public height: number,
        public tileWidth: number,
        public tileHeight: number,
        public font: string,
    ) {
        this.defaultBackground = 'black';
        this.defaultForeground = 'white';

        this.canvas = document.createElement('canvas');
        this.canvas.width = width * tileWidth;
        this.canvas.height = height * tileHeight;

        this.cells = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.cells.push(
                    new DisplayCell(
                        this,
                        x * this.tileWidth,
                        y * this.tileHeight,
                        this.tileWidth,
                        this.tileHeight,
                    ),
                );
            }
        }

        parent.append(this.canvas);
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get rendering context');

        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.ctx = ctx;
    }

    update() {
        this.cells.forEach((cell) => cell.draw(this.ctx));
    }

    fill(char: string) {
        const tok = {
            fg: this.defaultForeground,
            bg: this.defaultBackground,
            char,
        };
        this.cells.forEach((c) => c.set(tok));
    }

    clear() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clearBorders() {
        this.cells.forEach((c) => c.border('transparent'));
    }

    at(x: number, y: number) {
        return this.cells[y * this.width + x];
    }

    str(sx: number, sy: number, s: string, fg?: string, bg?: string) {
        const tok: Token = {
            fg: fg ? fg : this.defaultForeground,
            bg: bg ? bg : this.defaultBackground,
            char: '',
        };

        let x = sx,
            y = sy;
        for (let i = 0; i < s.length; i++) {
            if (s[i] === '\n') {
                x = sx;
                y++;
                continue;
            }

            tok.char = s[i];
            this.at(x++, y).set(tok);
        }
    }
}
