import vec2 from "./vec2.js";

export default class CatmullRope {
    constructor(stage, path) {
        this._stage = stage;
        this._path = path;
        this._init();
    }

    _init() {
        this._setup = false;
        this._modifiedPath = [];

        // runs smooth up to 31000 sections
        this._ropeSections = 480;//2400;
        this._ropeLength = 918; // <- is this to do with the image resolution?
        this._sectionLength = this._ropeLength / this._ropeSections;

        this._startDot = PIXI.Sprite.from('goldCircle.png');
        this._endDot = PIXI.Sprite.from('goldCircle.png');
        this._startDot.anchor.set(0.5, 0.5); // = new PIXI.ObservablePoint(0.5, 0.5);
        this._endDot.anchor.set(0.5, 0.5);

        this._points = [];
        for (var i = 0; i < this._ropeSections; i++)
        {
            this._points.push(new PIXI.Point(i * this._sectionLength, 0));
        }

        this._goldBar = PIXI.Texture.fromImage('goldBar.png');
        this._goldBar.anchor = new PIXI.ObservablePoint(0.5, 0.5);
        this._strip = new PIXI.mesh.Rope(this._goldBar, this._points);

        this._snakeContainer = new PIXI.Container();

        //this._snakeContainer.scale.set(800 / 1100);
        this._stage.addChild(this._startDot);
        this._stage.addChild(this._endDot);
        this._stage.addChild(this._snakeContainer);

        this._snakeContainer.addChild(this._strip);

        this._fakeDeltaTime = 0.015;
        this._T = 0;

        // start animating
    }

    animate() {
        if ( this._T === 1) {
            return;
        }
        for (var i = 0; i < this._points.length; i++) {
            const pos = this._catmullRom(this._path, this._T * (i/this._points.length))

            this._points[i].x = pos.x;
            this._points[i].y = pos.y;

            //Positionthis._StartDot()
            if (i === 0) {
                this._startDot.x =  pos.x;
                this._startDot.y =  pos.y;
            }

            //Positionthis._EndDot
            if (i === this._points.length -1) {
                this._endDot.x = pos.x;
                this._endDot.y = pos.y;
            }

            this._T += this._fakeDeltaTime * (1/this._ropeSections) * 0.3;
            this._T = this._T > 1 ? 1 : this._T; 
        }
    }

    _catmullRom(path, t) {
        
        if (!this._setup) {
            this._setupPath(path);
            //Show points
            // this._modifiedPath.forEach((point, i) => {
            //     const dot = PIXI.Sprite.from('goldCircle.png');
            //     dot.anchor.set(0.5, 0.5);
            //     dot.x = point.x;
            //     dot.y = point.y;
            //     dot.tint = i % 3 === 0 ? 0x00FF00 : 0xFF00FF;
            //     stage.addChild(dot);
            // });
            this._setup = true;
        }
        if (t > 0.75) {
            let v = 0;
        }
        const noOfPassThruPoints = (this._modifiedPath.length - 1) / 3;
        let startPoint = Math.floor(noOfPassThruPoints * t) * 3;
        const passThruPointToPointLength = 1/noOfPassThruPoints; // only lerp every 3 this._points ??
        const stepBetweenPassThruPoints = (t - ((startPoint / 3) * passThruPointToPointLength)) * (1/passThruPointToPointLength);
        return this._cubicBezier(
            this._modifiedPath[startPoint], 
            this._modifiedPath[startPoint + 1], 
            this._modifiedPath[startPoint + 2], 
            this._modifiedPath[startPoint + 3], 
            stepBetweenPassThruPoints);
    }

    _cubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        
        let p = vec2.multiply(uuu, p0); 
        p = vec2.add(p, vec2.multiply(3 * uu * t, p1)); 
        p = vec2.add(p, vec2.multiply(3 * u * tt, p2)); 
        p = vec2.add(p, vec2.multiply(ttt, p3)); 
        
        return p;
    }

    _setupPath(path) {
        for (let i = 1; i < path.length -1; i++) {
            this._modifiedPath.push(path[i]);
            if (i === path.length - 2) {
                return;
            }
            let q = vec2.multiply(0.1666, vec2.minus(path[i + 1], path[i - 1])); // divide by 6
            this._modifiedPath.push(vec2.add(path[i], q));
            let o = vec2.multiply(0.1666, vec2.minus(path[i + 2], path[i]));
            this._modifiedPath.push(vec2.minus(path[i + 1], o));
        }
    }
}

// lerpPath(path, t) {
//     const startPoint = Math.floor(path.length * t);
//     const passThruPointToPointLength = 1/path.length;
//     const stepBetweenPassThruPoints = (t - (startPoint * passThruPointToPointLength)) * (1/passThruPointToPointLength);
//     return vec2.lerp(path[startPoint], path[startPoint + 1], stepBetweenPassThruPoints);
// }

// lerp(a, b, t) {
//     return a + ((b - a) * t);
// }