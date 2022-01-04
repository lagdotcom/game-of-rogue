import Game from './Game';
import { Dir } from './types';

type InputHandler = (code: string, shift: boolean, ctrl: boolean) => boolean;

export default class Input {
    handler?: InputHandler;
    listening: boolean;

    constructor(public g: Game) {
        this.listening = false;
        document.addEventListener('keydown', this.keydown.bind(this));
    }

    getChoice<T>(
        header: string,
        items: T[],
        getName: (t: T) => string,
        cb: (t: T) => unknown,
    ) {
        let prompt = `${header}`;

        const choices = new Map<string, T>();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const ch = String.fromCharCode(97 + i);
            const name = getName(item);
            choices.set(ch, item);
            prompt += `\n${ch}: ${name}`;
        }

        this.g.prompt.show(prompt);
        this.handler = (code: string) => {
            const item = choices.get(code);
            if (item) {
                cb(item);
                this.g.prompt.clear();
                return true;
            }

            if (code === 'Escape') {
                this.g.prompt.clear();
                return true;
            }

            return false;
        };
    }

    getDirection(prompt: string, cb: (d: Dir) => unknown) {
        this.g.prompt.show(prompt);

        const cbh = (d: Dir) => {
            cb(d);
            this.g.prompt.clear();
            return true;
        };

        this.handler = (code: string) => {
            switch (code) {
                case 'ArrowUp':
                    return cbh(Dir.N);
                case 'PageUp':
                    return cbh(Dir.NE);
                case 'ArrowRight':
                    return cbh(Dir.E);
                case 'PageDown':
                    return cbh(Dir.SE);
                case 'ArrowDown':
                    return cbh(Dir.S);
                case 'End':
                    return cbh(Dir.SW);
                case 'ArrowLeft':
                    return cbh(Dir.W);
                case 'Home':
                    return cbh(Dir.NW);
            }

            this.g.prompt.clear();
            return true;
        };
    }

    keydown(e: KeyboardEvent) {
        if (!this.listening) return;
        //this.g.t.message('keydown', e.key);

        if (this.handler) {
            // TODO this is slightly risky...
            e.preventDefault();

            if (this.handler(e.key, e.shiftKey, e.metaKey)) {
                this.handler = undefined;
            }

            return;
        }

        if (this.playerInput(e.key, e.shiftKey, e.metaKey)) e.preventDefault();
    }

    playerInput(code: string, shift: boolean, ctrl: boolean): boolean {
        switch (code) {
            case 'ArrowUp':
                return this.g.playerMove(Dir.N);
            case 'PageUp':
                return this.g.playerMove(Dir.NE);
            case 'ArrowRight':
                return this.g.playerMove(Dir.E);
            case 'PageDown':
                return this.g.playerMove(Dir.SE);
            case 'ArrowDown':
                return this.g.playerMove(Dir.S);
            case 'End':
                return this.g.playerMove(Dir.SW);
            case 'ArrowLeft':
                return this.g.playerMove(Dir.W);
            case 'Home':
                return this.g.playerMove(Dir.NW);

            case 'd':
                return this.g.playerDrop();
            case 'e':
                return this.g.playerEquip();
            case 'g':
                return this.g.playerGet();

            // TEMP
            case '1':
                return this.usePlayerSkill(0);
            case '2':
                return this.usePlayerSkill(1);

            // DEBUG
            case 'r':
                return this.g.debugNewFloor();
            case 's':
                return this.g.debugShowAll();

            default:
                return false;
        }
    }

    usePlayerSkill(index: number): true {
        const sk = this.g.player.class.skills[index];
        if (sk) this.g.playerSkill(sk);
        return true;
    }
}
