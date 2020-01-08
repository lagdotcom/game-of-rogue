import bend from '../res/room/bend.txt';
import grandHall from '../res/room/grand-hall.txt';
import guardedVault from '../res/room/guarded-vault.txt';
import junction from '../res/room/junction.txt';
import longCorridor from '../res/room/long-corridor.txt';
import smallTreasure from '../res/room/small-treasure.txt';
import tinyPillarHall from '../res/room/tiny-pillar-hall.txt';
import yard from '../res/room/yard.txt';
import { Grid } from './grid';

function room(name: string, s: string) {
    let lines = s.replace('\r', '').split('\n');
    let g = new Grid(lines[0].length, lines.length);
    g.name = name;

    for (let y = 0; y < g.height; y++)
        for (let x = 0; x < g.width; x++) g.set(x, y, lines[y][x]);

    return g;
}

export const rooms = [
    ['bend', bend],
    ['grand-hall', grandHall],
    ['guarded-vault', guardedVault],
    ['junction', junction],
    ['long-corridor', longCorridor],
    ['small-treasure', smallTreasure],
    ['tiny-pillar-hall', tinyPillarHall],
    ['yard', yard],
].map(a => room(a[0], a[1]));
