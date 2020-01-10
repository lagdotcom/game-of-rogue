import { Dir } from './types';

/**
 * Number of attempts to place a room before exiting roomgen
 */
export const ROOMGEN_ATTEMPTS = 1000;

/**
 * Minimum amount of rooms per floor
 */
export const ROOMGEN_MINROOMS = 6;

/**
 * Minimum amount of enemies per floor
 */
export const ROOMGEN_MINENEMIES = 10;

/**
 * Percentage chance of generating magic-level items
 */
export const MAGIC_CHANCE = 5;

/**
 * Percentage chance of generating artifact-level items
 */
export const ARTIFACT_CHANCE = 1;

/**
 * Degree step in lights calculations, lower is more accurate
 */
export const LIGHTS_STEP = 1;

/**
 * Line step in lights calculations, higher is more accurate (but probably superfluous?)
 */
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
