import { Dir } from './types';

export const ROOMGEN_ATTEMPTS = 1000;
export const ROOMGEN_MINROOMS = 6;
export const ROOMGEN_MINENEMIES = 10;
export const MAGIC_CHANCE = 5;
export const ARTIFACT_CHANCE = 1;
export const LIGHTS_STEP = 1;
export const LIGHTS_FRAGMENTS = 3;

export const dirOffsets: { [dir: number]: { x: number; y: number } } = {
    [Dir.North]: { x: 0, y: -1 },
    [Dir.NorthEast]: { x: 1, y: -1 },
    [Dir.East]: { x: 1, y: 0 },
    [Dir.SouthEast]: { x: 1, y: 1 },
    [Dir.South]: { x: 0, y: 1 },
    [Dir.SouthWest]: { x: -1, y: 1 },
    [Dir.West]: { x: -1, y: 0 },
    [Dir.NorthWest]: { x: -1, y: -1 },
};

export const dirAngles: { [dir: number]: number } = {
    [Dir.North]: 270,
    [Dir.NorthEast]: 315,
    [Dir.East]: 0,
    [Dir.SouthEast]: 45,
    [Dir.South]: 90,
    [Dir.SouthWest]: 135,
    [Dir.West]: 180,
    [Dir.NorthWest]: 225,
};
