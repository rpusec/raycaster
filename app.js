const BLOCK_DIM = 20;
const WALL_HEIGHT = 200;

window.onload = function(){
    let canvas2d = document.createElement('canvas');
    document.body.appendChild(canvas2d);

    let canvas3d = document.createElement('canvas');
    document.body.appendChild(canvas3d);

    getImageContext('level-data.png').then(imgData => {
        let screenDim = {
            width: imgData.width * BLOCK_DIM,
            height: imgData.height * BLOCK_DIM,
        };

        canvas2d.setAttribute('width', screenDim.width);
        canvas2d.setAttribute('height', screenDim.height);

        canvas3d.setAttribute('width', screenDim.width);
        canvas3d.setAttribute('height', screenDim.height);

        const playerSpeed = 1;
        const turningSpeed = .01;
        const fov = 120;
        const raySpace = .0025;

        let blocks = [];
        let firstDraw = false;

        let playerPosition = {
            x: BLOCK_DIM * 2,
            y: BLOCK_DIM * 2,
        };

        let playerAngle = 0;

        let walking = {
            up: false,
            down: false,
        };

        let turning = {
            left: false,
            right: false,
        };

        const handleWalking = (e) => {
            let isKeyDown = e.type == 'keydown';
            switch(e.code){
                case 'KeyW' : 
                    walking.up = isKeyDown;
                    break;
                case 'KeyA' : 
                    turning.left = isKeyDown;
                    break;
                case 'KeyD' : 
                    turning.right = isKeyDown;
                    break;
                case 'KeyS' : 
                    walking.down = isKeyDown;
                    break;
            }
        }

        document.addEventListener('keydown', handleWalking);
        document.addEventListener('keyup', handleWalking);

        let ctx = canvas2d.getContext('2d');
        let ctx3d = canvas3d.getContext('2d');

        let canvas2dRes = canvas2d.width * canvas2d.height;

        const draw = () => {
            draw3d(draw2d());
            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);

        function draw3d(rays){
            ctx3d.clearRect(0, 0, canvas3d.width, canvas3d.height);

            let segmentWidth = screenDim.width / rays.length;

            rays.forEach((dist, index) => {
                let segmentHeight = WALL_HEIGHT - (dist / 2);
                if(segmentHeight < 0) segmentHeight = 0;

                let x = index * segmentWidth;
                let y = screenDim.height / 2 - segmentHeight / 2;
                let width = (index + 1) * segmentWidth;
                let height = segmentHeight;

                ctx3d.fillStyle = "rgb(0, 255, 0)";
                ctx3d.fillRect(x, y, width, height);

                ctx3d.fillStyle = `rgba(0, 0, 0, ${1 - segmentHeight / WALL_HEIGHT})`;
                ctx3d.fillRect(x, y, width, height);
            });
        }

        function draw2d(){
            let moveCos = Math.cos(playerAngle);
            let moveSin = Math.sin(playerAngle);

            if(walking.up) {
                playerPosition.x += moveCos * playerSpeed;
                playerPosition.y += moveSin * playerSpeed;
            }
            if(walking.down) {
                playerPosition.x -= moveCos * playerSpeed;
                playerPosition.y -= moveSin * playerSpeed;
            }
            if(turning.left) playerAngle -= turningSpeed;
            if(turning.right) playerAngle += turningSpeed;

            ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);

            ctx.fillStyle = "#000000";

            for(let c = 0; c < imgData.width; c++){
                for(let r = 0; r < imgData.height; r++){
    
                    let data = imgData.context.getImageData(c, r, 1, 1).data;
                    let color = `${data[0]}${data[1]}${data[2]}${data[3]}`;
    
                    if(color === '000255') {
                        let block = {
                            x: c * BLOCK_DIM,
                            y: r * BLOCK_DIM,
                            width: BLOCK_DIM,
                            height: BLOCK_DIM,
                        };
                        ctx.fillRect(block.x, block.y, block.width, block.height);
                        !firstDraw && blocks.push(block);
                    }
                }
            }
    
            ctx.fillStyle = "#FF0000";
            ctx.beginPath();
            ctx.arc(playerPosition.x, playerPosition.y, BLOCK_DIM / 2, 0, Math.PI * 2);
            ctx.fill();

            let rays = [];

            for(let i = fov - 1; i > 0; i--){
                rays.push(getAndDrawRays(playerAngle + i * raySpace));
            }

            for(let i = 0; i >= (fov * -1); i--){
                rays.push(getAndDrawRays(playerAngle + i * raySpace));
            }

            firstDraw = true;

            function getAndDrawRays(angle){
                let cos = Math.cos(angle);
                let sin = Math.sin(angle);

                let rayFromX = playerPosition.x;
                let rayFromY = playerPosition.y;

                let rayToX = playerPosition.x + cos * canvas2dRes;
                let rayToY = playerPosition.y + sin * canvas2dRes;

                let rayPoints = [];

                blocks.forEach(block => {
                    [
                        [rayFromX, rayFromY, rayToX, rayToY, block.x, block.y, block.x, block.y + block.height],
                        [rayFromX, rayFromY, rayToX, rayToY, block.x, block.y, block.x + block.width, block.y],
                        [rayFromX, rayFromY, rayToX, rayToY, block.x + block.width, block.y, block.x + block.width, block.y + block.height],
                        [rayFromX, rayFromY, rayToX, rayToY, block.x + block.width, block.y + block.height, block.x, block.y + block.height],
                    ].forEach(args => {
                        let rayPoint = getRayPoint(args);
                        if(rayPoint) rayPoints.push(rayPoint);
                    });
                });

                let closestRayPoint = rayPoints[0];
                let closestDist = getDist(closestRayPoint.x, closestRayPoint.y, playerPosition.x, playerPosition.y);

                rayPoints.forEach(rayPoint => {
                    let dist = getDist(rayPoint.x, rayPoint.y, playerPosition.x, playerPosition.y);
                    if(dist < closestDist){
                        closestRayPoint = rayPoint;
                        closestDist = dist;
                    }
                });

                ctx.strokeStyle = "#00FF00";
                ctx.beginPath();
                ctx.moveTo(playerPosition.x, playerPosition.y);
                ctx.lineTo(playerPosition.x + cos * closestDist, playerPosition.y + sin * closestDist);
                ctx.stroke();
                ctx.fill();

                return closestDist;
            }

            return rays;
        }
    });
}

function getImageContext(url) {
    return new Promise(resolve => {
        var img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        img.onload = () => {
            context.drawImage(img, 0, 0);
            resolve({
                width: img.width,
                height: img.height,
                context: context,
            });
        }
    });
}

function getRayPoint(args){
    if(lineLine.apply(this, args)) return getLineLineInsertionPoint.apply(this, args);
    return null;
}

function lineLine(x1, y1, x2, y2, x3, y3, x4, y4){
    var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}

function getLineLineInsertionPoint(x1, y1, x2, y2, x3, y3, x4, y4){
    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false
    }

    var denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
    if (denominator === 0) {
        return false
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1)
    let y = y1 + ua * (y2 - y1)

    return {x, y}
}

function getDist(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}