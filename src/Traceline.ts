import { XY } from './types';
import { Actor } from './Actor';

export interface Traceline {
    start: XY;
    projected: XY;
    end: XY;
    visited: Set<XY>;
    hit?: Actor;
}
