import Player from './Player';
import { Floor } from './Floor';

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
}
