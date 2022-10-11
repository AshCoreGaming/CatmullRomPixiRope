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
let path0 = [];
path0 = [
    new vec2(100, 100),
    new vec2(200, 200),
    new vec2(200, 300),
    new vec2(100, 400)
]

// log the tangent vectors at T values of 0, 0.5, and 1
// to check the derivative math works out
/*
    p'(t) = 
    p0( -3tpow2 + 6t-3 ) +
    p1( 9tpow2 -12t+3  ) +
    p2( -9tpow2 + 6t   ) +
    p3( 3tpow2         )
*/
function derivative(path, t) {
    const p0 = vec2.multiply((Math.pow(t, 2) * -3) + (  (6 * t) - 3),  path[0]);
    const p1 = vec2.multiply((Math.pow(t, 2) *  9) + ((-12 * t) + 3),  path[1]);
    const p2 = vec2.multiply((Math.pow(t, 2) * -9) + (   6 * t     ),  path[2]);
    const p3 = vec2.multiply((Math.pow(t, 2) *  3)                  ,  path[3]);
    const tangent = vec2.add(p0, vec2.add(p1, vec2.add(p2, p3)));
    console.log(`Tangent: ${tangent.x}, ${tangent.y}`);
    const magTing = vec2.magnitude(vec2.minus(p1, path[1]));
    console.log(`magnitude of t(${t}) point along path minus path point 1: ${magTing}`);
}

const magni = vec2.magnitude(new vec2(0, 2));
console.log(magni);
derivative(path0, 0);
derivative(path0, 0.5);
derivative(path0, 1);

// using to learn about weights
function _cubicBezier(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    let p = vec2.multiply(uuu, p0); 
    p = vec2.add(p, vec2.multiply(3 * uu * t, p1)); 
    p = vec2.add(p, vec2.multiply(3 * u * tt, p2)); 
    p = vec2.add(p, vec2.multiply(ttt, p3)); 
    console.log(`val: ${3 * uu * t}, t: ${t}`);
    return p;
}

for (let i = 0; i < 101; i++) {
    const t = i * 0.01;
    const pointy = _cubicBezier(path0[0], path0[1], path0[2], path0[3], t);
    //console.log(`Point at t = ${t} is {${pointy.x}, ${pointy.y}}`);
}


let path1 = [];
let path2 = [];
let path3 = [];
let path4 = [];
path0.forEach(p => {
    path1.push(new vec2(p.x, p.y + 20));
    path2.push(new vec2(p.x, p.y + 40));
    path3.push(new vec2(p.x, p.y + 60));
    path4.push(new vec2(p.x, p.y + 80));
});

//randomisePathPoints(path0);
randomisePathPoints(path1);
randomisePathPoints(path2);
randomisePathPoints(path3);
randomisePathPoints(path4);


function randomisePathPoints(path) {
    path.forEach(p => {
        p.x += (Math.random() - 0.5) * 16;
        p.y += (Math.random() - 0.5) * 16;
    });
}

//Show points
path0.forEach((point, i) => {
    const dot = PIXI.Sprite.from('gldDot.png');
    dot.anchor.set(0.5, 0.5);
    dot.x = point.x;
    dot.y = point.y;
    dot.tint = 0x00FF00;
    if (i === 0 || i == path0.length - 1) {
        dot.tint = 0x005FFF;
    }
    stage.addChild(dot);
});

const line0 = new CatmullRope(stage, path0);
const line1 = new CatmullRope(stage, path1);
const line2 = new CatmullRope(stage, path2);
const line3 = new CatmullRope(stage, path3);
const line4 = new CatmullRope(stage, path4);

requestAnimationFrame(animate);

function animate() {
    line0.animate();
    // line1.animate();
    // line2.animate();
    // line3.animate();
    // line4.animate();

    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
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
