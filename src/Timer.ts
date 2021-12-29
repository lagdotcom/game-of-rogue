import { TIMER_FREQUENCY } from './constants';

export default class Timer {
    active: boolean;
    callback: () => any;
    handle: ReturnType<typeof setInterval>;
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
