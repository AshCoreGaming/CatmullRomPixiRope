import vec2 from "./vec2.js";
import CatmullRope from "./catmullRope.js";

var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);
// create the root of the scene graph
const stage = new PIXI.Container();
const bg = new PIXI.Sprite.from("oculus.jpg");
bg.scale.x = 0.5;
bg.scale.y = 0.5;
stage.addChild(bg);

// Path points
// you need at least 4 points
// the first and last point aren't drawn they get used to help determine the initial direction of the line
// Things to consider when placing path points to get a nice smooth line 
// If you desire such a thing
// points too close together generally don't look too good
// large variation in the distance between points don't look too good
// acute angles between points don't look too good, especially if there's also variation in the distance
let paths = [5];
paths[0] = [
    new vec2(-550, 150),
    new vec2(-50, 150),
    new vec2(650, 150),
    new vec2(150, 500),
    new vec2(650, 500),
    new vec2(1550, 500),
    new vec2(1050, 500),
]

//randomisePathPoints(paths[0]);

//Show points
paths[0].forEach((point, i) => {
    const dot = PIXI.Sprite.from('gldDot.png');
    dot.anchor.set(0.5, 0.5);
    dot.x = point.x;
    dot.y = point.y;
    dot.tint = 0x00FF00;
    if (i === 0 || i == paths[0].length - 1) {
        dot.tint = 0x005FFF;
    }
    stage.addChild(dot);
});

const tension = -0.2;
let stave = [5];
stave[0] = new CatmullRope({stage, path: paths[0], tension});
createOffsetLines(stave[0]);

function createOffsetLines(catmullRope) {
    // a large offsetMagnitude will kink corners if path points are too close together
    const offsetMagnitude = 25;
    const normalData = catmullRope.getNotmalsAtPassThruPoints();
    for (let i = 0; i < 4; i++) {
        const j = i+1;
        paths[j] = [];
        normalData.forEach(pointy => {
            const aboveLine = i > 1 ? -1 : 1;
            const lineOffset = ((i + 1) % 2) + 1;
            paths[j].push(vec2.add(pointy.point, vec2.multiply(offsetMagnitude * (lineOffset * aboveLine), pointy.normal)));
        });
        //randomisePathPoints(paths[j]);
        stave[j] = new CatmullRope({stage, path: paths[j], tension});
    }
}


requestAnimationFrame(animate);

function animate() {
    stave.forEach(line => {
        line.animate();
    })
    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}

function randomisePathPoints(path) {
    path.forEach(p => {
        p.x += (Math.random() - 0.5) * 16;
        p.y += (Math.random() - 0.5) * 16;
    });
}

// path0 = [
//     new vec2(0,150),
//     new vec2(150,150),
//     new vec2(150,50),
//     new vec2(250,50),
//     new vec2(250,150),
//     new vec2(250,250),
//     new vec2(150,250),
//     new vec2(150,350),
//     new vec2(250,350),
//     new vec2(350,350),
//     new vec2(450,350),
//     new vec2(550,350),
//     new vec2(550,250),
//     new vec2(550,150),
//     new vec2(450,150),
//     new vec2(450,250),
//     new vec2(350,250),
//     new vec2(350,150),
//     new vec2(350,50),
//     new vec2(550,50),
//     new vec2(650,50),
//     new vec2(650,150),
//     new vec2(750,150),
//     new vec2(750,250),
//     new vec2(650,250),
//     new vec2(650,350),
//     new vec2(750,350),
//     new vec2(750,450),
//     new vec2(750,550),
//     new vec2(650,550),
//     new vec2(650,450),
//     new vec2(550,450),
//     new vec2(450,450),
//     new vec2(450,550),
//     new vec2(350,550),
//     new vec2(250,550),
//     new vec2(150,550),
//     new vec2(150,450),
//     new vec2(250,450),
//     new vec2(350,450),
// ]

// path0 = [
//     new vec2(0,550),
//     new vec2(50,550),
//     new vec2(300,450),
//     new vec2(450,200),
//     new vec2(700,100),
//     new vec2(850,50),
// ]
