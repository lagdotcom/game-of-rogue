import { Skill } from './Skill';
import Player from './Player';

export interface Class {
    name: string;
    skills: Skill[];
    hp: number;
    hpGain: number;
    ki: number;
    kiGain: number;
    str: number;
    strGain: number;

    init(p: Player);
}
