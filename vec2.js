export default class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static add(a, b) {
        return new vec2(a.x + b.x, a.y + b.y);
    }
    
    static minus(a, b) {
        return new vec2(a.x - b.x, a.y - b.y);
    }
    
    static multiply(s, a) {
        return new vec2(s * a.x, s * a.y);
    }

    static lerp(a, b, t) {
        return this.add(a, (this.multiply(t, this.minus(b, a))));
    }
}