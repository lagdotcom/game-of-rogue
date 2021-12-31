export default class Trace {
    level: number;
    on: boolean;

    constructor() {
        this.level = 0;
        this.on = true;
    }

    enter(item: string, ...args: any[]) {
        this.message(item, ...args);
        this.level++;
    }

    message(item: string, ...args: any[]) {
        if (this.on) console.log(this.space() + item, ...args);
    }

    todo(item: string, ...args: any[]) {
        return this.message('TODO:' + item, ...args);
    }

    leave(item: string) {
        this.level--;
    }

    private space() {
        let spacing = '';
        for (let i = 0; i < this.level; i++) spacing += '> ';
        return spacing;
    }
}
