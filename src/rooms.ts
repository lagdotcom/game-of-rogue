import { Grid } from './Grid';

function room(name: string, s: string) {
    const lines = s.replace('\r', '').split('\n');
    const g = new Grid(name, lines[0].length, lines.length);

    for (let y = 0; y < g.height; y++)
        for (let x = 0; x < g.width; x++) g.set(x, y, lines[y][x]);

    return g;
}

const roomTxt = require.context('../res/room', true, /\.txt$/);
export const rooms = roomTxt.keys().map((k) => room(k, roomTxt(k).default));
