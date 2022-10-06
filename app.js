class vec2 {
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

var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);
// create the root of the scene graph
const stage = new PIXI.Container();

let setup = false;
let modifiedPath = [];
// Path points
let path = [];
path = [
    new vec2(100,500),
    new vec2(200,300),
    new vec2(300,300),
    new vec2(400,200),
    new vec2(500,300),
    new vec2(500,400),
    new vec2(600,350),
    new vec2(600,250),
    new vec2(500,200),
    new vec2(400,100),
    new vec2(200,100),
    new vec2(200,150),
    new vec2(150,200),
    new vec2(150,250),
    new vec2(200,450),
    new vec2(400,550),
    new vec2(600,450),
    new vec2(700,250),
    new vec2(500,50),
    new vec2(200,0),
]
// Show points
// path.forEach((point, i) => {
//     const dot = PIXI.Sprite.from('goldCircle.png');
//     dot.anchor.set(0.5, 0.5);
//     dot.x = point.x;
//     dot.y = point.y;
//     dot.tint = 0x00FF00;
//     if (i === 0 || i == path.length - 1) {
//         dot.tint = 0x005FFF;
//     }
//     stage.addChild(dot);
// });

// runs smooth up to 31000 sections
const ropeSections = 480;//2400;
const ropeLength = 918; // <- is this to do with the image resolution?
const sectionLength = ropeLength / ropeSections;
const diameter = 100; // Spiral diameter, will become obsolete when we do catmull rom

const startDot = PIXI.Sprite.from('goldCircle.png');
const endDot = PIXI.Sprite.from('goldCircle.png');
startDot.anchor.set(0.5, 0.5); // = new PIXI.ObservablePoint(0.5, 0.5);
endDot.anchor.set(0.5, 0.5);

let points = [];
for (var i = 0; i < ropeSections; i++)
{
    points.push(new PIXI.Point(i * sectionLength, 0));
}

const goldBar = PIXI.Texture.fromImage('goldBar.png');
goldBar.anchor = new PIXI.ObservablePoint(0.5, 0.5);
const strip = new PIXI.mesh.Rope(goldBar, points);

const snakeContainer = new PIXI.Container();

//snakeContainer.scale.set(800 / 1100);
stage.addChild(startDot);
stage.addChild(endDot);
stage.addChild(snakeContainer);

snakeContainer.addChild(strip);

// start animating
requestAnimationFrame(animate);

const fakeDeltaTime = 0.015;
let angle = 0;
const origin = { x:0, y:0 };
let spiralCenter = { x: 0, y: 0 };
let T = 0;
function animate() {
    if ( T === 1) {
        return;
    }
    for (var i = 0; i < points.length; i++) {
        const pos = catmullRom(path, T * (i/points.length))

        points[i].x = pos.x;
        points[i].y = pos.y;

        //PositionStartDot()
        if (i === 0) {
            startDot.x =  pos.x;
            startDot.y =  pos.y;
        }

        //PositionEndDot
        if (i === points.length -1) {
            endDot.x = pos.x;
            endDot.y = pos.y;
        }

        T += fakeDeltaTime * (1/ropeSections) * 0.3;
        T = T > 1 ? 1 : T; 
    }

    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}

function lerpPath(path, t) {
    const startPoint = Math.floor(path.length * t);
    const passThruPointToPointLength = 1/path.length;
    const stepBetweenPassThruPoints = (t - (startPoint * passThruPointToPointLength)) * (1/passThruPointToPointLength);
    return vec2.lerp(path[startPoint], path[startPoint + 1], stepBetweenPassThruPoints);
}

function lerp(a, b, t) {
    return a + ((b - a) * t);
}

function catmullRom(path, t) {
    
    if (!setup) {
        setupPath(path);
        //Show points
        // modifiedPath.forEach((point, i) => {
        //     const dot = PIXI.Sprite.from('goldCircle.png');
        //     dot.anchor.set(0.5, 0.5);
        //     dot.x = point.x;
        //     dot.y = point.y;
        //     dot.tint = i % 3 === 0 ? 0x00FF00 : 0xFF00FF;
        //     stage.addChild(dot);
        // });
        setup = true;
    }
    if (t > 0.75) {
        let v = 0;
    }
    const noOfPassThruPoints = (modifiedPath.length - 1) / 3;
    let startPoint = Math.floor(noOfPassThruPoints * t) * 3;
    const passThruPointToPointLength = 1/noOfPassThruPoints; // only lerp every 3 points ??
    const stepBetweenPassThruPoints = (t - ((startPoint / 3) * passThruPointToPointLength)) * (1/passThruPointToPointLength);
    return cubicBezier(
        modifiedPath[startPoint], 
        modifiedPath[startPoint + 1], 
        modifiedPath[startPoint + 2], 
        modifiedPath[startPoint + 3], 
        stepBetweenPassThruPoints);
}

function cubicBezier(p0, p1, p2, p3, t) {
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

function setupPath(path) {
    for (let i = 1; i < path.length -1; i++) {
        modifiedPath.push(path[i]);
        if (i === path.length - 2) {
            return;
        }
        q = vec2.multiply(0.1666, vec2.minus(path[i + 1], path[i - 1])); // divide by 6
        modifiedPath.push(vec2.add(path[i], q));
        o = vec2.multiply(0.1666, vec2.minus(path[i + 2], path[i]));
        modifiedPath.push(vec2.minus(path[i + 1], o));
    }
}


