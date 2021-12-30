import { getDirectionBetween } from './tools';
import { Dir } from './types';

const xy = (x: number, y: number) => ({ x, y });

describe('getDirectionBetween', () => {
    it.each([
        [10, 10, 12, 10, 'E'],
        [10, 10, 8, 10, 'W'],
        [10, 10, 10, 12, 'S'],
        [10, 10, 10, 8, 'N'],
        [10, 10, 11, 11, 'SE'],
        [10, 10, 11, 9, 'NE'],
        [10, 10, 9, 9, 'NW'],
        [10, 10, 9, 11, 'SW'],
        [10, 10, 0, 4, 'NW'],
        [10, 10, 4, 0, 'NW'],
        [10, 10, 6, 0, 'N'],
        [10, 10, 14, 0, 'N'],
        [10, 10, 16, 0, 'NE'],
        [10, 10, 0, 14, 'W'],
    ])('check %d,%d -> %d,%d = %s', (fx, fy, tx, ty, dir) => {
        expect(Dir[getDirectionBetween(xy(fx, fy), xy(tx, ty))]).toBe(dir);
    });
});
