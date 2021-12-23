import { Token } from './types';

export class DisplayCell {
    el: HTMLElement;
    f: string;
    b: string;
    bo: string;
    x: number;
    y: number;
    value: string;

    constructor(parent: Display) {
        this.el = document.createElement('div');
        this.el.className = 'dc';
        parent.container.append(this.el);

        this.fg('white');
        this.bg('black');
        this.text(' ');
        this.border('transparent');
    }

    set(tok: Token) {
        this.fg(tok.fg);
        this.bg(tok.bg);
        this.text(tok.char);
        this.border('transparent');
    }

    fg(colour?: string) {
        if (colour !== undefined && this.f != colour)
            this.el.style.color = this.f = colour;
        return this.f;
    }

    bg(colour?: string) {
        if (colour !== undefined && this.b != colour)
            this.el.style.backgroundColor = this.b = colour;
        return this.b;
    }

    border(colour?: string) {
        if (colour !== undefined && this.bo != colour) {
            this.el.style.borderColor = this.bo = colour;
        }
        return this.bo;
    }

    text(text?: string) {
        if (text !== undefined) this.el.innerText = this.value = text;
        return this.value;
    }
}

export class Display {
    cells: DisplayCell[];
    container: HTMLElement;
    defaultBackground: string;
    defaultForeground: string;
    height: number;
    parent: HTMLElement;
    width: number;

    constructor(parent: HTMLElement, width: number, height: number) {
        this.parent = parent;
        this.width = width;
        this.height = height;
        this.defaultBackground = 'black';
        this.defaultForeground = 'white';
        this.makeContainer();
    }

    fill(char: string) {
        const tok = {
            fg: this.defaultForeground,
            bg: this.defaultBackground,
            char,
        };
        this.cells.forEach((c) => c.set(tok));
    }

    at(x: number, y: number) {
        return this.cells[y * this.width + x];
    }

    str(x: number, y: number, s: string, fg?: string, bg?: string) {
        const tok: Token = {
            fg: fg ? fg : this.defaultForeground,
            bg: bg ? bg : this.defaultBackground,
            char: '',
        };

        for (let i = 0; i < s.length; i++) {
            tok.char = s[i];
            this.at(x + i, y).set(tok);
        }
    }

    private makeContainer() {
        this.container = document.createElement('div');
        this.container.className = 'dg';
        this.container.style.gridTemplateColumns = this.gtc();
        this.container.style.maxWidth = this.width + 'em';

        this.cells = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.cells.push(new DisplayCell(this));
            }
        }

        this.parent.append(this.container);
    }

    private gtc() {
        const cols = [];

        for (let x = 0; x < this.width; x++) cols.push('1fr');

        return cols.join(' ');
    }
}
