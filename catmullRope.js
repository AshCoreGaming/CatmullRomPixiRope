import vec2 from "./vec2.js";

export default class CatmullRope {
    constructor(stage, path) {
        this._stage = stage;
        this._path = path;
        this._init();
    }

    _init() {
        this._tau = Math.PI * 2;
        this._setup = false;
        this._modifiedPath = [];
        this._speed = (Math.random() * 0.1) + 0.9; // some initial speed variance
        this._angle = Math.random() * this._tau; // used to vary speed over time
        this._speedVariance = Math.random() * 0.5; // amount of speed variance
        this._speedVarianceFrequency = (Math.random() * 0.5) + 0.5; // rate of speed variance

        this._globalAngle = 0; // so some of the undulation is shared by the whole stave

        // runs smooth up to 31000 sections
        this._ropeSections = 480;//2400;
        this._ropeLength = 918; // <- is this to do with the image resolution?
        this._sectionLength = this._ropeLength / this._ropeSections;

        this._startDot = PIXI.Sprite.from('gldDot.png');
        this._endDot = PIXI.Sprite.from('gldDot.png');
        this._startDot.anchor.set(0.5, 0.5); // = new PIXI.ObservablePoint(0.5, 0.5);
        this._endDot.anchor.set(0.5, 0.5);

        this._points = [];
        for (var i = 0; i < this._ropeSections; i++)
        {
            this._points.push(new PIXI.Point(i * this._sectionLength, 0));
        }

        // I think the minimum width of the snake might be 16 pixels, discovered when trying to use the 8 pixel tall 'gldSt
        this._goldBar = PIXI.Texture.fromImage('gldStrip.png');
        this._goldBar.anchor = new PIXI.ObservablePoint(0.5, 0.5);
        this._strip = new PIXI.mesh.Rope(this._goldBar, this._points);

        this._snakeContainer = new PIXI.Container();

        //this._snakeContainer.scale.set(800 / 1100);
        this._stage.addChild(this._startDot);
        this._stage.addChild(this._endDot);
        this._stage.addChild(this._snakeContainer);

        this._snakeContainer.addChild(this._strip);

        this._fakeDeltaTime = 1.8;
        this._T = 0;
    }

    animate() {
        
        for (var i = 0; i < this._points.length; i++) {
            const point = this._points[i];
            const relativeT = this._T * (i/this._points.length);
            let pos = new vec2(point.x, point.y);

                pos = this._catmullRom(this._path, relativeT);
                point.x = pos.x;
                point.y = pos.y;

            //undulate
            point.y += Math.sin(this._globalAngle + (relativeT * 6)) * 8; // global undulation (whole stave)
            point.y += Math.sin(this._angle + (relativeT * 9)) * 4; // local undulation (this line)
            point.x += Math.sin(this._angle + (relativeT * 3)) * 3; 

            //Positionthis._StartDot()
            if (i === 0) {
                this._startDot.x =  point.x;
                this._startDot.y =  point.y;
            }

            //Positionthis._EndDot
            if (i === this._points.length -1) {
                this._endDot.x = point.x;
                this._endDot.y = point.y;
            }
        }
        const variedSpeed = this._speed + (Math.sin(this._angle) * this._speedVariance);
        this._angle += this._fakeDeltaTime * 0.02 * this._speedVarianceFrequency;
        this._T += this._fakeDeltaTime * (1/this._ropeSections) * variedSpeed;
        this._T = this._T > 1 ? 1 : this._T; 

        this._globalAngle += this._fakeDeltaTime * 0.02;

        if (this._angle > this._tau) {
            this._angle -= this._tau;
        }

        if (this._globalAngle > this._tau) {
            this._globalAngle -= this._tau;
        }
    }

    _catmullRom(path, t) {
        
        if (!this._setup) {
            this._setupPath(path);
            // Show points
            this._modifiedPath.forEach((point, i) => {
                const dot = PIXI.Sprite.from('gldDot.png');
                dot.anchor.set(0.5, 0.5);
                dot.x = point.x;
                dot.y = point.y;
                dot.tint = i % 3 === 0 ? 0x00FF00 : 0xFF00FF;
                this._stage.addChild(dot);
            });
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