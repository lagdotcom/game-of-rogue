import ambushYard from '../res/room/ambush-yard.txt';
import bend from '../res/room/bend.txt';
import grandHall from '../res/room/grand-hall.txt';
import guardedVault from '../res/room/guarded-vault.txt';
import junction from '../res/room/junction.txt';
import longCorridor from '../res/room/long-corridor.txt';
import smallTreasure from '../res/room/small-treasure.txt';
import tJunction from '../res/room/t-junction.txt';
import tinyPillarHall from '../res/room/tiny-pillar-hall.txt';
import yard from '../res/room/yard.txt';
import { Grid } from './Grid';

function room(name: string, s: string) {
    let lines = s.replace('\r', '').split('\n');
    let g = new Grid(name, lines[0].length, lines.length);

    for (let y = 0; y < g.height; y++)
        for (let x = 0; x < g.width; x++) g.set(x, y, lines[y][x]);

    return g;
}

export const rooms = [
    ['ambush-yard', ambushYard],
    ['bend', bend],
    ['grand-hall', grandHall],
    ['guarded-vault', guardedVault],
    ['junction', junction],
    ['long-corridor', longCorridor],
    ['small-treasure', smallTreasure],
    ['t-junction', tJunction],
    ['tiny-pillar-hall', tinyPillarHall],
    ['yard', yard],
].map(a => room(a[0], a[1]));
