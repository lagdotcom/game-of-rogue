import Player from './Player';
import { Skill } from './Skill';

export interface Class {
    name: string;
    skills: Skill[];
    hp: number;
    hpGain: number;
    ki: number;
    kiGain: number;
    str: number;
    strGain: number;

    init(p: Player): void;
}
