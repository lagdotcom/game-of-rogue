import { isDefined } from './tools';
import { Dir, Token } from './types';

export class DisplayCell {
    f!: string;
    b!: string;
    bo!: string;
    fa?: Dir;
    value!: string;
    dirty: boolean;
    mx: number;
    my: number;
    ex: number;
    ey: number;

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
        this.mx = x + w / 2;
        this.my = y + h / 2;
        this.ex = x + w - 1;
        this.ey = y + h - 1;
    }

    set(tok: Token, dir?: Dir) {
        this.fg(tok.fg);
        this.bg(tok.bg);
        this.text(tok.char);
        this.border('transparent');
        if (isDefined(dir)) this.face(dir);
        else this.unFace();
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

    face(dir?: Dir) {
        if (dir !== undefined && this.fa !== dir) {
            this.dirty = true;
            this.fa = dir;
        }
        return this.fa;
    }
    unFace() {
        if (this.fa) {
            this.dirty = true;
            this.fa = undefined;
        }
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
            ctx.strokeText(this.value, this.mx, this.my + 1);

            if (this.bo !== 'transparent') {
                ctx.strokeStyle = this.bo;
                ctx.strokeRect(this.x, this.y, this.w, this.h);
            }

            if (isDefined(this.fa)) this.drawDir(ctx, this.fa);
        }
    }

    drawDir(ctx: CanvasRenderingContext2D, d: Dir) {
        ctx.strokeStyle = 'white';
        ctx.beginPath();

        switch (d) {
            case Dir.N:
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.ex, this.y);
                break;

            case Dir.NE:
                ctx.moveTo(this.mx, this.y);
                ctx.lineTo(this.ex, this.y);
                ctx.lineTo(this.ex, this.my);
                break;

            case Dir.E:
                ctx.moveTo(this.ex, this.y);
                ctx.lineTo(this.ex, this.ey);
                break;

            case Dir.SE:
                ctx.moveTo(this.ex, this.my);
                ctx.lineTo(this.ex, this.ey);
                ctx.lineTo(this.mx, this.ey);
                break;

            case Dir.S:
                ctx.moveTo(this.ex, this.ey);
                ctx.lineTo(this.x, this.ey);
                break;

            case Dir.SW:
                ctx.moveTo(this.mx, this.ey);
                ctx.lineTo(this.x, this.ey);
                ctx.lineTo(this.x, this.my);
                break;

            case Dir.W:
                ctx.moveTo(this.x, this.ey);
                ctx.lineTo(this.x, this.y);
                break;

            case Dir.NW:
                ctx.moveTo(this.x, this.my);
                ctx.lineTo(this.x, this.y);
                ctx.lineTo(this.mx, this.y);
                break;
        }

        ctx.stroke();
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
