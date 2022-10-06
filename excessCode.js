function animate() {
    for (var i = 0; i < points.length; i++) {
        // stretch the rope
        const T = i / points.length;
        let x = lerp(origin.x, spiralCenter.x, T) * 0.001;
        // make it spiral
        x += Math.sin(lerp(0, angle, T)) * diameter;
        let y = Math.sin(lerp(0, angle, T) + 90) * diameter;

        points[i].x = x; 
        points[i].y = y;
        //console.log(`OriginX: ${origin.x} spiralCenter.x: ${spiralCenter.x} LerpResult: ${points[i].x}`);

        angle += fakeDeltaTime * (1/ropeSections) * 3;
        spiralCenter.x += angle * 0.01; 
        spiralCenter.y += angle * 0.01;
        if (angle > 360) {
            angle -= 360;
        }

        //PositionStartDot()
        if (i === 0) {
            startDot.x = startPos.x + x;
            startDot.y = startPos.y + y;
        }

        //PositionEndDot
        if (i === points.length -1) {
            endDot.x = startPos.x + x;
            endDot.y = startPos.y + y;
        }
    }

    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}