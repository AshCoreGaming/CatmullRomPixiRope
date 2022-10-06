import vec2 from "./vec2.js";
import CatmullRope from "./catmullRope.js";

var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);
// create the root of the scene graph
const stage = new PIXI.Container();

// Path points
let path0 = [];
path0 = [
    new vec2(0,150),
    new vec2(150,150),
    new vec2(150,50),
    new vec2(250,50),
    new vec2(250,150),
    new vec2(250,250),
    new vec2(150,250),
    new vec2(150,350),
    new vec2(250,350),
    new vec2(350,350),
    new vec2(450,350),
    new vec2(550,350),
    new vec2(550,250),
    new vec2(550,150),
    new vec2(450,150),
    new vec2(450,250),
    new vec2(350,250),
    new vec2(350,150),
    new vec2(350,50),
    new vec2(550,50),
    new vec2(650,50),
    new vec2(650,150),
    new vec2(750,150),
    new vec2(750,250),
    new vec2(650,250),
    new vec2(650,350),
    new vec2(750,350),
    new vec2(750,450),
    new vec2(750,550),
    new vec2(650,550),
    new vec2(650,450),
    new vec2(550,450),
    new vec2(450,450),
    new vec2(450,550),
    new vec2(350,550),
    new vec2(250,550),
    new vec2(150,550),
    new vec2(150,450),
    new vec2(250,450),
    new vec2(350,450),
]

let path1 = [];
let path2 = [];
path0.forEach(p => {
    path1.push(new vec2(p.x, p.y + 16));
    path2.push(new vec2(p.x, p.y + 32));
});

randomisePathPoints(path0);
randomisePathPoints(path1);
randomisePathPoints(path2);


function randomisePathPoints(path) {
    path.forEach(p => {
        p.x += (Math.random() - 0.5) * 30;
        p.y += (Math.random() - 0.5) * 30;
    });
}

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

const line0 = new CatmullRope(stage, path0);
const line1 = new CatmullRope(stage, path1);
const line2 = new CatmullRope(stage, path2);

requestAnimationFrame(animate);

function animate() {
    line0.animate();
    line1.animate();
    line2.animate();

    // render the stage
    renderer.render(stage);
}
