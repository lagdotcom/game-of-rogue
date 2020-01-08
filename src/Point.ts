export default class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    equals(o: Point) {
        return this.x == o.x && this.y == o.y;
    }
}
