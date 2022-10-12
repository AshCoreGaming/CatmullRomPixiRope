import vec2 from "./vec2.js";

export default class CatmullRope {
    constructor(initData) {
        this._initVars(initData);
    }

    get path() {
        return this._path;
    }
    getNotmalsAtPathPoints() {
        let normalData = [];
        for (let i = 0; i < this._noOfPassThruPoints; i++) {
            const startPoint = i * 3;
            for (let j = 0; j < 3; j++) {
                const t = j * 0.33;
                let tangent = this._derivative(this._path[startPoint], 
                    this._path[startPoint + 1], 
                    this._path[startPoint + 2], 
                    this._path[startPoint + 3], 
                    t
                );
                tangent = vec2.normalize(tangent);
                const normal = vec2.rotate90Clockwise(tangent);
                normalData.push({point: this._path[startPoint + j], normal});
            }
            if (i === this._noOfPassThruPoints - 1) {
                let tangent = this._derivative(this._path[startPoint], 
                    this._path[startPoint + 1], 
                    this._path[startPoint + 2], 
                    this._path[startPoint + 3], 
                    1
                );
                tangent = vec2.normalize(tangent);
                const normal = vec2.rotate90Clockwise(tangent);
                normalData.push({point: this._path[startPoint + 3], normal});
            }
        }
        console.log(this._path);
        console.log(normalData);
        return normalData;
    }

    _initVars(initData) {
        this._tensionConst = 0.1666; // divide by 6, this is the convention and makes what I think
        // is a zero tension Catmull Rom
        // tension mostly works as expected between between -0.5 and 1. But do your thing :)
        const { stage, path, tension=0, alreadyCatmullRomPath=false} = initData;
        this._stage = stage;
        this._path = path;
        this._tension = this._tensionConst - (this._tensionConst * tension);
        this._setup = alreadyCatmullRomPath;
        
        // setup path
        this._originalPath = this._path;
        this._path = this._setup ? this._path : this._setupPath();
        this._noOfPassThruPoints = (this._path.length - 1) / 3;
        this._passThruPointToPointLength = 1/this._noOfPassThruPoints; // only lerp every 3 this._points ??
        this._showPoints();

        // setup motion
        this._tau = Math.PI * 2;
        this._speed = (Math.random() * 0.1) + 0.9; // some initial speed variance
        this._angle = Math.random() * this._tau; // used to vary speed over time
        this._speedVariance = Math.random() * 0.5; // amount of speed variance
        this._speedVarianceFrequency = (Math.random() * 0.5) + 0.5; // rate of speed variance
        this._undulationAmplitudeX = 3;
        this._undulationAmplitudeY = 4;
        this._undulationWavelenghtX = 3;
        this._undulationWavelengthY = 9;
        this._undulationVelocity = 0.01;

        // this will be done by the stave class so we only do it once in the actual ting
        this._staveAngle = 0; // so some of the undulation is shared by the whole stave
        this._staveUndulationAmplitudeY = 8;
        this._staveUndulationFrequencyY = 6;
        this._staveUndulationVelocity = 0.005;

        // runs smooth up to 31000 sections
        this._ropeSections = 480;//2400;
        this._ropeLength = 918; // <- is this to do with the image resolution?
        this._sectionLength = this._ropeLength / this._ropeSections;

        this._startDot = PIXI.Sprite.from('gldDot.png');
        this._endDot = PIXI.Sprite.from('gldDot.png');
        this._startDot.anchor.set(0.5, 0.5); // = new PIXI.ObservablePoint(0.5, 0.5);
        this._endDot.anchor.set(0.5, 0.5);

        // setup pixi rope
        this._points = [];
        for (var i = 0; i < this._ropeSections; i++)
        {
            this._points.push(new PIXI.Point(i * this._sectionLength, 0));
        }
        this._goldBar = PIXI.Texture.fromImage('gldStrip.png');
        this._goldBar.anchor = new PIXI.ObservablePoint(0.5, 0.5);
        this._line = new PIXI.mesh.Rope(this._goldBar, this._points);

        // setup the stage
        this._lineContainer = new PIXI.Container();
        this._lineContainer.addChild(this._line);
        this._stage.addChild(this._startDot);
        this._stage.addChild(this._endDot);
        this._stage.addChild(this._lineContainer);

        this._fakeDeltaTime = 5;
        this._T = 0;
    }

    animate() {
        for (var i = 0; i < this._points.length; i++) {
            const point = this._points[i];
            const relativeT = this._T * (i/this._points.length);
            let pos = new vec2(point.x, point.y);

            pos = this._catmullRom(relativeT);
            point.x = pos.x;
            point.y = pos.y;

            //undulate, we might add stave wide x undulations also
            point.y += Math.sin(this._staveAngle + (relativeT * this._staveUndulationFrequencyY)) * this._staveUndulationAmplitudeY; // global undulation (whole stave)
            point.x += Math.sin(this._angle + (relativeT * this._undulationWavelenghtX)) * this._undulationAmplitudeX; // local undulation (this line)
            point.y += Math.sin(this._angle + (relativeT * this._undulationWavelengthY)) * this._undulationAmplitudeY; 

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
        this._angle += this._fakeDeltaTime * this._undulationVelocity * this._speedVarianceFrequency;
        this._T += this._fakeDeltaTime * (1/this._ropeSections) * variedSpeed;
        this._T = this._T > 1 ? 1 : this._T; 

        this._staveAngle += this._fakeDeltaTime * this._staveUndulationVelocity;

        if (this._angle > this._tau) {
            this._angle -= this._tau;
        }

        if (this._staveAngle > this._tau) {
            this._staveAngle -= this._tau;
        }
    }

    _catmullRom(t) {
        let startPoint = Math.floor(this._noOfPassThruPoints * t) * 3;
        const stepBetweenPassThruPoints = (t - ((startPoint / 3) * this._passThruPointToPointLength)) * (1/this._passThruPointToPointLength);
        return this._cubicBezier(
            this._path[startPoint], 
            this._path[startPoint + 1], 
            this._path[startPoint + 2], 
            this._path[startPoint + 3], 
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

    _derivative(p0, p1, p2, p3, t) {
        p0 = vec2.multiply((Math.pow(t, 2) * -3) + (  (6 * t) - 3),  p0);
        p1 = vec2.multiply((Math.pow(t, 2) *  9) + ((-12 * t) + 3),  p1);
        p2 = vec2.multiply((Math.pow(t, 2) * -9) + (   6 * t     ),  p2);
        p3 = vec2.multiply((Math.pow(t, 2) *  3)                  ,  p3);
        const tangent = vec2.add(p0, vec2.add(p1, vec2.add(p2, p3)));
        return tangent;
        //const magTing = vec2.magnitude(vec2.minus(p1, path[1]));
    }

    _setupPath() {
        let modifiedPath = [];
        for (let i = 1; i < this._path.length -1; i++) {
            modifiedPath.push(this._path[i]);
            if (i === this._path.length - 2) {
                return modifiedPath;
            }
            let q = vec2.multiply(this._tension, vec2.minus(this._path[i + 1], this._path[i - 1]));
            modifiedPath.push(vec2.add(this._path[i], q));
            let o = vec2.multiply(this._tension, vec2.minus(this._path[i + 2], this._path[i]));
            modifiedPath.push(vec2.minus(this._path[i + 1], o));
        }
    }

    _showPoints() {
        this._path.forEach((point, i) => {
            const dot = PIXI.Sprite.from('gldDot.png');
            dot.anchor.set(0.5, 0.5);
            dot.x = point.x;
            dot.y = point.y;
            dot.tint = i % 3 === 0 ? 0x00FF00 : 0xFF00FF;
            this._stage.addChild(dot);
        });
    }
}

// lerpPath(path, t) {
//     const startPoint = Math.floor(path.length * t);
//     const this._passThruPointToPointLength = 1/path.length;
//     const stepBetweenPassThruPoints = (t - (startPoint * this._passThruPointToPointLength)) * (1/this._passThruPointToPointLength);
//     return vec2.lerp(path[startPoint], path[startPoint + 1], stepBetweenPassThruPoints);
// }

// lerp(a, b, t) {
//     return a + ((b - a) * t);
// }