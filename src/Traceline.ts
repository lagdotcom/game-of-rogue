import { Actor } from './Actor';
import { XY } from './types';

export interface Traceline {
    start: XY;
    projected: XY;
    end: XY;
    visited: Set<XY>;
    hit?: Actor;
}
