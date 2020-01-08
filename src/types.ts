import Player from './Player';
import { Floor } from './Floor';
import Point from './Point';

export interface GameEventMap {
    'architect.begin': GameEvent;
    'architect.end': FloorEvent;
    'floor.enter': FloorEvent;
    'player.move': PlayerEvent;
    'player.turn': PlayerEvent;
}

export interface GameEvent {}

export interface FloorEvent extends GameEvent {
    floor: Floor;
}

export interface PlayerEvent extends GameEvent {
    player: Player;
}

export enum Tile {
    Door = '+',
    Empty = ' ',
    Space = '.',
    Wall = '#',

    NotDoor = 'd',
    Enemy = 'E',
    Treasure = '$',
    Player = '@',
}

export interface Token {
    bg: string;
    char: string;
    fg: string;
}

export interface Actor extends Token {
    energy: number;
    pos: Point;
}

export enum Dir {
    North,
    NorthEast,
    East,
    SouthEast,
    South,
    SouthWest,
    West,
    NorthWest,
}
