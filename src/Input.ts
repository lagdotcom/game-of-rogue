import Game from './Game';
import { Dir } from './types';

type InputHandler = (code: string, shift: boolean, ctrl: boolean) => boolean;

export default class Input {
    handler: InputHandler;
    listening: boolean;

    constructor(public g: Game) {
        this.listening = false;
        document.addEventListener('keydown', this.keydown.bind(this));
    }

    getDirection(prompt: string, cb: (d: Dir) => any) {
        this.g.t.todo('getDirection', prompt);
        this.g.prompt.show(prompt);

        const cbh = (d: Dir) => {
            cb(d);
            this.g.prompt.clear();
            return true;
        };

        this.handler = (code: string, shift: boolean, ctrl: boolean) => {
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
            if (this.handler(e.key, e.shiftKey, e.metaKey)) {
                this.handler = null;
            }

            return;
        }

        return this.playerInput(e.key, e.shiftKey, e.metaKey);
    }

    playerInput(code: string, shift: boolean, ctrl: boolean) {
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

            // TEMP
            case '1':
                const sk = this.g.player.class.skills[0];
                if (sk && sk.fn) this.g.playerSkill(sk);
                return;

            // DEBUG
            case 'r':
                return this.g.debugNewFloor();

            case 's':
                return this.g.debugShowAll();
        }
    }
}
