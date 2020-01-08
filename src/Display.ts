export class DisplayCell {
    el: HTMLElement;
    f: string;
    b: string;
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
    }

    set(fg: string, bg: string, text: string) {
        this.fg(fg);
        this.bg(bg);
        this.text(text);
    }

    fg(colour?: string) {
        if (colour !== undefined) this.el.style.color = this.f = colour;
        return this.f;
    }

    bg(colour?: string) {
        if (colour !== undefined)
            this.el.style.backgroundColor = this.b = colour;
        return this.b;
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

    fill(s: string) {
        this.cells.forEach(c =>
            c.set(this.defaultForeground, this.defaultBackground, s),
        );
    }

    at(x: number, y: number) {
        return this.cells[y * this.width + x];
    }

    str(x: number, y: number, s: string) {
        for (let i = 0; i < s.length; i++) {
            this.at(x + i, y).text(s[i]);
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
        let cols = [];

        for (let x = 0; x < this.width; x++) cols.push('1fr');

        return cols.join(' ');
    }
}
