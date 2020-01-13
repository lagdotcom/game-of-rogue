import { TIMER_FREQUENCY } from './consts';

export default class Timer {
    active: boolean;
    callback: () => any;
    handle: number;
    length: number;

    constructor(cb: () => any) {
        this.active = false;
        this.callback = cb;
        this.length = TIMER_FREQUENCY;
    }

    start() {
        this.active = true;
        this.handle = setInterval(this.callback, this.length);
    }

    stop() {
        this.active = false;
        clearInterval(this.handle);
    }
}
