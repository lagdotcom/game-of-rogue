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

/**
 * How often to call Game.next()
 */
export const TIMER_FREQUENCY = 50;

export const dirOffsets: { [dir: number]: { x: number; y: number } } = {
    [Dir.N]: { x: 0, y: -1 },
    [Dir.NE]: { x: 1, y: -1 },
    [Dir.E]: { x: 1, y: 0 },
    [Dir.SE]: { x: 1, y: 1 },
    [Dir.S]: { x: 0, y: 1 },
    [Dir.SW]: { x: -1, y: 1 },
    [Dir.W]: { x: -1, y: 0 },
    [Dir.NW]: { x: -1, y: -1 },
};

export const dirAngles: { [dir: number]: number } = {
    [Dir.N]: 270,
    [Dir.NE]: 315,
    [Dir.E]: 0,
    [Dir.SE]: 45,
    [Dir.S]: 90,
    [Dir.SW]: 135,
    [Dir.W]: 180,
    [Dir.NW]: 225,
};
