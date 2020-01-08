import Game from './Game';
import { Dir } from './types';

export default class Input {
    g: Game;

    constructor(g: Game) {
        this.g = g;
        document.addEventListener('keydown', this.keydown.bind(this));
    }

    keydown(e: KeyboardEvent) {
        return this.playerInput(e.key, e.shiftKey, e.metaKey);
    }

    playerInput(code: string, shift: boolean, ctrl: boolean) {
        switch (code) {
            case 'ArrowUp':
                return this.g.playerMove(Dir.North);
            case 'PageUp':
                return this.g.playerMove(Dir.NorthEast);
            case 'ArrowRight':
                return this.g.playerMove(Dir.East);
            case 'PageDown':
                return this.g.playerMove(Dir.SouthEast);
            case 'ArrowDown':
                return this.g.playerMove(Dir.South);
            case 'End':
                return this.g.playerMove(Dir.SouthWest);
            case 'ArrowLeft':
                return this.g.playerMove(Dir.West);
            case 'Home':
                return this.g.playerMove(Dir.NorthWest);
        }
    }
}
