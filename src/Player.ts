import { Actor, Dir, XY, Tile } from './types';
import Game from './Game';
import { getSightCone } from './lights';

export default class Player implements Actor {
    isActor: true;
    isPlayer: true;
    bg: string;
    char: string;
    energy: number;
    facing: Dir;
    fg: string;
    fov: number;
    g: Game;
    pos: XY;
    sight: number;

    constructor(g: Game) {
        this.isActor = this.isPlayer = true;
        this.bg = '#202020';
        this.char = '@';
        this.facing = Dir.North;
        this.fg = 'white';
        this.fov = 160;
        this.g = g;
        this.sight = 5;
    }

    litTiles() {
        return getSightCone(this);
    }
}
