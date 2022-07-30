const BLOCK_DIM = 20;
const MAX_SHADOW_PERC = .25;
const PLAYER_SPEED = 1;
const TURNING_SPEED = .01;
const RAY_SPACE = .0025;
const RAY_AMOUNT_ONE_SIDE = 140;

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

        let running = false;
        let strafe = false;

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
            running = e.shiftKey;
            strafe = e.altKey;
            e.preventDefault();
            
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
            ctx3d.clearRect(0, 0, screenDim.width, screenDim.height);

            let maxSegmentWidth = screenDim.width / rays.length;

            rays.forEach((dist, index) => {
                let segmentWidth = maxSegmentWidth;

                let segmentHeight = (BLOCK_DIM / dist) * screenDim.width;
                if(segmentHeight < 0) segmentHeight = 0;

                let x = index * maxSegmentWidth;
                let y = screenDim.height / 2 - segmentHeight / 2;
                let width = segmentWidth;
                let height = segmentHeight;

                x = Math.ceil(x);
                y = Math.ceil(y);
                width = Math.ceil(width);
                height = Math.ceil(height);

                ctx3d.fillStyle = "rgb(0, 255, 0)";
                ctx3d.fillRect(x, y, width, height);

                let shadowPerc = 1 - segmentHeight / 100;
                if(shadowPerc > MAX_SHADOW_PERC) shadowPerc = MAX_SHADOW_PERC;

                ctx3d.fillStyle = `rgba(0, 0, 0, ${shadowPerc})`;
                ctx3d.fillRect(x, y, width, height);
            });
        }

        function draw2d(){
            let moveCos = Math.cos(playerAngle);
            let moveSin = Math.sin(playerAngle);

            let _playerSpeed = PLAYER_SPEED * (running ? 4 : 1);
            let _turningSpeed = TURNING_SPEED * (running ? 4 : 1);

            if(walking.up) {
                playerPosition.x += moveCos * _playerSpeed;
                playerPosition.y += moveSin * _playerSpeed;
            }
            if(walking.down) {
                playerPosition.x -= moveCos * _playerSpeed;
                playerPosition.y -= moveSin * _playerSpeed;
            }

            if(strafe){
                if(turning.left) {
                    playerPosition.x += Math.cos(playerAngle + Math.PI / 2) * _playerSpeed;
                    playerPosition.y += Math.sin(playerAngle + Math.PI / 2) * _playerSpeed;
                }
                if(turning.right) {
                    playerPosition.x -= Math.cos(playerAngle + Math.PI / 2) * _playerSpeed;
                    playerPosition.y -= Math.sin(playerAngle + Math.PI / 2) * _playerSpeed;
                }
            }
            else{
                if(turning.left) playerAngle += _turningSpeed;
                if(turning.right) playerAngle -= _turningSpeed;
            }

            ctx.clearRect(0, 0, screenDim.width, screenDim.height);

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

            for(let i = RAY_AMOUNT_ONE_SIDE - 1; i > 0; i--){
                rays.push(getAndDrawRays(playerAngle + i * RAY_SPACE));
            }

            for(let i = 0; i > (RAY_AMOUNT_ONE_SIDE * -1); i--){
                rays.push(getAndDrawRays(playerAngle + i * RAY_SPACE));
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
                    let rayConds = {
                        left: [rayFromX, rayFromY, rayToX, rayToY, block.x, block.y, block.x, block.y + block.height],
                        top: [rayFromX, rayFromY, rayToX, rayToY, block.x, block.y, block.x + block.width, block.y],
                        right: [rayFromX, rayFromY, rayToX, rayToY, block.x + block.width, block.y, block.x + block.width, block.y + block.height],
                        bottom: [rayFromX, rayFromY, rayToX, rayToY, block.x + block.width, block.y + block.height, block.x, block.y + block.height],
                    }
                    Object.keys(rayConds).forEach(dir => {
                        let rayPoint = getRayPoint(rayConds[dir]);
                        if(rayPoint) rayPoints.push({
                            dir: dir,
                            point: rayPoint,
                        });
                    });
                });

                let closestRayPoint = rayPoints[0];
                let closestDist = getDist(closestRayPoint.point.x, closestRayPoint.point.y, playerPosition.x, playerPosition.y);

                rayPoints.forEach(rayPoint => {
                    let dist = getDist(rayPoint.point.x, rayPoint.point.y, playerPosition.x, playerPosition.y);
                    if(dist < closestDist){
                        closestRayPoint = rayPoint;
                        closestDist = dist;
                    }
                });

                let lineToData = {
                    x: playerPosition.x + cos * closestDist,
                    y: playerPosition.y + sin * closestDist,
                };

                ctx.strokeStyle = "#00FF00";
                ctx.beginPath();
                ctx.moveTo(playerPosition.x, playerPosition.y);
                ctx.lineTo(lineToData.x, lineToData.y);
                ctx.stroke();
                ctx.fill();

                return closestDist;
            }

            return rays;
        }
    });
}

function calcAngleDiff(a1, a2){
    if(a1 < 0) a1 += Math.PI * 2;
    if(a2 < 0) a2 += Math.PI * 2;

    a1 = (a1*180/Math.PI) % 360;
    a2 = (a2*180/Math.PI) % 360;

    if(Math.floor(a1 - a2) > 180){
        if(a1 < a2) a1 += 360;
        if(a2 < a1) a2 += 360;
    }

    if(a1 > a2) return a1 - a2;
    return a2 - a1;
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