import utils from './utils.js';

const BLOCK_DIM = 20;
const PLAYER_BLOCK = 16;
const MAX_SHADOW_PERC = .25;
const PLAYER_SPEED = 1;
const RAY_SPACE = .01;
const RAY_AMOUNT_ONE_SIDE = 50;
const RAYS_SKIPPED_TO_DRAW_2D = 20;

let playerAngle = 0;

let canvas2d = document.createElement('canvas');
document.body.appendChild(canvas2d);

let canvas2dMouse = {
    x: null,
    y: null,
}

let drawActive = false;
let eraseActive = false;

canvas2d.addEventListener('mousedown', e => {
    if(e.button === 0) {
        drawActive = true;
        eraseActive = false;
    }
    else {
        eraseActive = true;
        drawActive = false;
    }
});

canvas2d.addEventListener('mouseup', e => {
    drawActive = false;
    eraseActive = false;
});

canvas2d.addEventListener('contextmenu', e => {
    e.preventDefault();
    return false;
});


canvas2d.addEventListener('mousemove', e => {
    canvas2dMouse.x = e.offsetX;
    canvas2dMouse.y = e.offsetY;
});

let canvas3d = document.createElement('canvas');
document.body.appendChild(canvas3d);

canvas3d.addEventListener('click', () => canvas3d.requestPointerLock());

canvas3d.addEventListener('mousemove', e => {
    if(document.pointerLockElement !== canvas3d) return;
    playerAngle -= e.movementX / 500;
});

let mapImgData = await getImageContext('level-data.png');
let mapCachedPixels = cacheImgData(mapImgData);

let wallImgPaths = ['wood.png', 'brick.png', 'steel.png'];
let wallTextures = {};

for(let imgName of wallImgPaths){
    let wallImgData = await getImageContext(`assets/${imgName}`);
    wallTextures[imgName] = {
        imgData: wallImgData,
        cachedPixels: cacheImgData(wallImgData),
    };
}

function cacheImgData(imgData){
    let cacheContainer = {};
    for(let c = 0; c < imgData.width; c++){
        for(let r = 0; r < imgData.height; r++){
            let data = imgData.context.getImageData(c, r, 1, 1).data;
            cacheContainer[`${c}-${r}`] = [data[0], data[1], data[2], data[3]];
        }
    }
    return cacheContainer;
}

let screenDim = {
    width: mapImgData.width * BLOCK_DIM,
    height: mapImgData.height * BLOCK_DIM,
};

canvas2d.setAttribute('width', screenDim.width);
canvas2d.setAttribute('height', screenDim.height);

canvas3d.setAttribute('width', screenDim.width);
canvas3d.setAttribute('height', screenDim.height);

let blocks = [];
let blocksWithPos = {};

let player = {
    x: BLOCK_DIM * 2,
    y: BLOCK_DIM * 2,
    width: PLAYER_BLOCK,
    height: PLAYER_BLOCK,
};

let walking = {
    up: false,
    down: false,
    left: false,
    right: false,
};

let running = false;

const handleWalking = (e) => {
    let isKeyDown = e.type == 'keydown';
    let unknownKey = true;
    switch(e.code){
        case 'KeyW' : 
            walking.up = isKeyDown;
            break;
        case 'KeyA' : 
            walking.left = isKeyDown;
            break;
        case 'KeyD' : 
            walking.right = isKeyDown;
            break;
        case 'KeyS' : 
            walking.down = isKeyDown;
            break;
        default: 
            unknownKey = false;
    }
    running = e.shiftKey;
    unknownKey && e.preventDefault();
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

    rays.every((ray, index) => {
        if(!ray.point) return true;

        let segmentWidth = maxSegmentWidth;

        let segmentHeight = (BLOCK_DIM / ray.dist) * screenDim.width;
        if(segmentHeight < 0) segmentHeight = 0;

        let texture = wallTextures[ray.imgName];

        let textureMappingX = Math.floor(texture.imgData.width * ray.offset);
        let texturePixelHeight = segmentHeight / texture.imgData.height;

        let x = index * maxSegmentWidth;
        let y = screenDim.height / 2 - segmentHeight / 2;
        let width = segmentWidth;
        let height = segmentHeight;

        x = Math.ceil(x);
        y = Math.ceil(y);
        width = Math.ceil(width);
        height = Math.ceil(height);

        for(let pixelY = 0; pixelY < height; pixelY += texturePixelHeight){
            let wallColorData = texture.cachedPixels[`${textureMappingX}-${Math.floor(pixelY / texturePixelHeight)}`];
            if(!wallColorData) continue;
            ctx3d.fillStyle = `rgb(${wallColorData[0]}, ${wallColorData[1]}, ${wallColorData[2]})`;
            if(pixelY + texturePixelHeight < height) ctx3d.fillRect(x, y + Math.ceil(pixelY), width, Math.ceil(texturePixelHeight));
        }

        let shadowPerc = 1 - segmentHeight / 100;
        if(shadowPerc > MAX_SHADOW_PERC) shadowPerc = MAX_SHADOW_PERC;

        ctx3d.fillStyle = `rgba(0, 0, 0, ${shadowPerc})`;
        ctx3d.fillRect(x, y, width, height);

        return true;
    });
}

function draw2d(){
    let moveCos = Math.cos(playerAngle);
    let moveSin = Math.sin(playerAngle);

    let _playerSpeed = PLAYER_SPEED * (running ? 4 : 1);

    if(walking.up) {
        player.x += moveCos * _playerSpeed;
        player.y += moveSin * _playerSpeed;
    }
    if(walking.down) {
        player.x -= moveCos * _playerSpeed;
        player.y -= moveSin * _playerSpeed;
    }
    if(walking.left) {
        player.x += Math.cos(playerAngle + Math.PI / 2) * _playerSpeed;
        player.y += Math.sin(playerAngle + Math.PI / 2) * _playerSpeed;
    }
    if(walking.right) {
        player.x -= Math.cos(playerAngle + Math.PI / 2) * _playerSpeed;
        player.y -= Math.sin(playerAngle + Math.PI / 2) * _playerSpeed;
    }

    ctx.clearRect(0, 0, screenDim.width, screenDim.height);

    ctx.fillStyle = "#000000";
    
    let mouseSelX = Math.floor(canvas2dMouse.x / BLOCK_DIM) * BLOCK_DIM;
    let mouseSelY = Math.floor(canvas2dMouse.y / BLOCK_DIM) * BLOCK_DIM;

    let cachedPropName = `${mouseSelX / BLOCK_DIM}-${mouseSelY / BLOCK_DIM}`;

    if(drawActive) mapCachedPixels[cachedPropName] = [0, 0, 0, 255];
    else if(eraseActive) {
        mapCachedPixels[cachedPropName] = [255, 255, 255, 255];
        let bi = blocks.indexOf(blocksWithPos[cachedPropName]);
        if(bi !== -1){
            blocks.splice(bi, 1);
            delete blocksWithPos[cachedPropName];
        }
    }

    let blockNum = 0, textureInd = 0;

    for(let c = 0; c < mapImgData.width; c++){
        for(let r = 0; r < mapImgData.height; r++){
            let data = mapCachedPixels[`${c}-${r}`];
            let color = `${data[0]}${data[1]}${data[2]}${data[3]}`;

            if(color === '000255') {
                let block = {
                    c: c,
                    r: r,
                    x: c * BLOCK_DIM,
                    y: r * BLOCK_DIM,
                    width: BLOCK_DIM,
                    height: BLOCK_DIM,
                    imgName: wallImgPaths[textureInd],
                };
                ctx.fillRect(block.x, block.y, block.width, block.height);
                if(!blocksWithPos[`${c}-${r}`]){
                    blocks.push(block);
                    blocksWithPos[`${c}-${r}`] = block;
                }
                blockNum++;
                if(blockNum % 5 === 0){
                    textureInd++;
                    if(textureInd > wallImgPaths.length - 1) textureInd = 0;
                }
            }
        }
    }

    ctx.strokeStyle = "#FF0000";
    ctx.beginPath();
    ctx.rect(mouseSelX, mouseSelY, BLOCK_DIM, BLOCK_DIM);
    ctx.stroke();

    let collisionRects = [];
    let collidedBlocks = [];

    blocks.forEach(block => {
        if(utils.playerBlockCollision(player, block)){
            collisionRects.push(utils.getCollisionInnerRect(player, block));
            collidedBlocks.push(block);
        }
    });

    (() => {
        if(collisionRects.length === 1 || collisionRects.length === 2){
            movePlayerOut(collisionRects.sort((r1, r2) => (r2.width + r2.height) - (r1.width + r1.height))[0]);
        }
        else if(collisionRects.length === 3){
            while(collidedBlocks.find(block => utils.playerBlockCollision(player, block))){
                collisionRects.forEach(collisionRect => movePlayerOut(collisionRect));
            }
        }

        function movePlayerOut(collisionRect){
            let offset = 0;
            if(collisionRect.height < collisionRect.width){
                if(collisionRect.y + collisionRect.height / 2 < player.y + player.height / 2) player.y = collisionRect.y + collisionRect.height + offset;
                else player.y = collisionRect.y - player.width - offset;
            }
            else {
                if(collisionRect.x + collisionRect.width / 2 < player.x + player.width / 2) player.x = collisionRect.x + collisionRect.width + offset;
                else player.x = collisionRect.x - player.height - offset;
            }
        }
    })();

    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, BLOCK_DIM / 2, 0, Math.PI * 2);
    ctx.fill();

    let rays = [];

    let rayCount = 0;

    for(let i = RAY_AMOUNT_ONE_SIDE - 1; i > 0; i--){
        rays.push(getAndDrawRays(playerAngle + i * RAY_SPACE));
    }

    for(let i = 0; i > (RAY_AMOUNT_ONE_SIDE * -1); i--){
        rays.push(getAndDrawRays(playerAngle + i * RAY_SPACE));
    }

    function getAndDrawRays(angle){
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        let rayFromX = player.x + player.width / 2;
        let rayFromY = player.y + player.height / 2;

        let rayToX = rayFromX + cos * canvas2dRes;
        let rayToY = rayFromY + sin * canvas2dRes;

        let rayPoints = [];

        blocks.forEach(block => {
            let rayConds = {
                left: [rayFromX, rayFromY, rayToX, rayToY, block.x, block.y, block.x, block.y + block.height],
                top: [rayFromX, rayFromY, rayToX, rayToY, block.x, block.y, block.x + block.width, block.y],
                right: [rayFromX, rayFromY, rayToX, rayToY, block.x + block.width, block.y, block.x + block.width, block.y + block.height],
                bottom: [rayFromX, rayFromY, rayToX, rayToY, block.x + block.width, block.y + block.height, block.x, block.y + block.height],
            }
            Object.keys(rayConds).forEach(dir => {
                let args = rayConds[dir];
                let rayPoint = utils.getRayPoint(args);

                if(!rayPoint) return;

                let blockFromX = args[4];
                let blockFromY = args[5];

                rayPoints.push({
                    dir: dir,
                    point: rayPoint,
                    offset: utils.getDist(blockFromX, blockFromY, rayPoint.x, rayPoint.y) / BLOCK_DIM,
                    imgName: block.imgName,
                });
            });
        });

        let closestRayPoint = null, closestDist = null;
        if(rayPoints.length > 0){
            closestRayPoint = rayPoints[0];
            closestDist = utils.getDist(closestRayPoint.point.x, closestRayPoint.point.y, rayFromX, rayFromY);

            rayPoints.forEach(rayPoint => {
                let dist = utils.getDist(rayPoint.point.x, rayPoint.point.y, rayFromX, rayFromY);
                if(dist < closestDist){
                    closestRayPoint = rayPoint;
                    closestDist = dist;
                }
            });
        }
        else{
            closestRayPoint = {point: null};
            closestDist = canvas2d.width + canvas2d.height;
        }

        if((rayCount % RAYS_SKIPPED_TO_DRAW_2D) === 0){
            let lineToData = {
                x: rayFromX + cos * closestDist,
                y: rayFromY + sin * closestDist,
            };

            ctx.strokeStyle = "#00FF00";
            ctx.beginPath();
            ctx.moveTo(rayFromX, rayFromY);
            ctx.lineTo(lineToData.x, lineToData.y);
            ctx.stroke();
            ctx.fill();
        }

        rayCount++;

        closestRayPoint.dist = closestDist * Math.cos(angle - playerAngle);

        return closestRayPoint;
    }

    return rays;
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