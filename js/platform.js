export default class Platform {
    constructor(x, y, vx, width, height) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.width = width;
        this.height = height;
    }

    nextTick() {
        this.x += this.vx;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.height;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.width;
    }
}
