import constants from "./constants.js";
import toolbox from "./toolbox.js";
import utils from "./utils.js";

let blocks = [];
let blocksWithPos = {};

let running = false;

let rayCount = 0;

let walking = {
    up: false,
    down: false,
    left: false,
    right: false,
};

let player = {
    angle: 0,
    x: constants.BLOCK_DIM * 2,
    y: constants.BLOCK_DIM * 2,
    width: constants.PLAYER_BLOCK,
    height: constants.PLAYER_BLOCK,
};

let playerConf = localStorage.getItem('player');
if(playerConf) player = JSON.parse(playerConf);

let canvas2dMouse = {
    x: null,
    y: null,
}

let drawActive = false;
let eraseActive = false;

let canvas2d, canvas3d;

let mapData = {};

export default {
    getWalkingProps(){
        return walking
    },
    getMouseSelCoord(){
        return {
            x: Math.floor(canvas2dMouse.x / constants.BLOCK_DIM) * constants.BLOCK_DIM,
            y: Math.floor(canvas2dMouse.y / constants.BLOCK_DIM) * constants.BLOCK_DIM,
        };
    },
    getBlocks(){
        return blocks;
    },
    getCanvases(){
        return {canvas2d, canvas3d};
    },
    setupGameplay(wallTextures){
        let storedMapData = localStorage.getItem('map-data');
        if(storedMapData){
            mapData = JSON.parse(storedMapData);
            Object.keys(mapData).every(key => {
                let data = mapData[key];
                if(!data) return true;

                data.img = wallTextures[data.imgName].imgData.imgElem;
                return true;
            });
        }
        else{
            for(let c = 0; c < constants.MAP_WIDTH; c++){
                for(let r = 0; r < constants.MAP_HEIGHT; r++){
                    mapData[`${c}-${r}`] = null;
                }
            }
        }

        canvas2d = document.createElement('canvas');
        document.getElementById('page').appendChild(canvas2d);

        let saveMapTimeout = null;

        canvas2d.addEventListener('mousedown', e => {
            if(e.button === 0) {
                drawActive = true;
                eraseActive = false;
            }
            else {
                eraseActive = true;
                drawActive = false;
            }

            clearTimeout(saveMapTimeout);
        });

        canvas2d.addEventListener('mouseup', e => {
            drawActive = false;
            eraseActive = false;

            clearTimeout(saveMapTimeout);
            saveMapTimeout = setTimeout(() => {
                localStorage.setItem('map-data', JSON.stringify(mapData));
            }, 2000);
        });

        canvas2d.addEventListener('contextmenu', e => {
            e.preventDefault();
            return false;
        });


        canvas2d.addEventListener('mousemove', e => {
            canvas2dMouse.x = e.offsetX;
            canvas2dMouse.y = e.offsetY;
        });

        canvas3d = document.createElement('canvas');

        // let canvas3dWrapper = document.createElement('div');
        // canvas3dWrapper.classList.add('wrapper');
        // canvas3dWrapper.append(canvas3d);
        // document.body.appendChild(canvas3dWrapper);

        document.getElementById('page').appendChild(canvas3d);

        canvas3d.addEventListener('click', () => canvas3d.requestPointerLock());

        canvas3d.addEventListener('mousemove', e => {
            if(document.pointerLockElement !== canvas3d) return;
            player.angle -= e.movementX / 500;
        });

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

        let t;
        document.addEventListener('keyup', e => {
            handleWalking(e);

            clearTimeout(t);
            t = setTimeout(() => localStorage.setItem('player', JSON.stringify(player)), 500);
        });
    },
    handleGameLogic(){
        let moveCos = Math.cos(player.angle);
        let moveSin = Math.sin(player.angle);

        let _playerSpeed = constants.PLAYER_SPEED * (running ? 4 : 1);

        if(walking.up) {
            player.x += moveCos * _playerSpeed;
            player.y += moveSin * _playerSpeed;
        }
        if(walking.down) {
            player.x -= moveCos * _playerSpeed;
            player.y -= moveSin * _playerSpeed;
        }
        if(walking.left) {
            player.x += Math.cos(player.angle + Math.PI / 2) * _playerSpeed;
            player.y += Math.sin(player.angle + Math.PI / 2) * _playerSpeed;
        }
        if(walking.right) {
            player.x -= Math.cos(player.angle + Math.PI / 2) * _playerSpeed;
            player.y -= Math.sin(player.angle + Math.PI / 2) * _playerSpeed;
        }

        let mouseSel = this.getMouseSelCoord();
        let cachedPropName = `${mouseSel.x / constants.BLOCK_DIM}-${mouseSel.y / constants.BLOCK_DIM}`;

        if(drawActive) {
            let activeItem = toolbox.getActiveItem();
            mapData[cachedPropName] = {
                imgName: activeItem.imgName,
                img: activeItem.img,
            }
        }
        else if(eraseActive) {
            mapData[cachedPropName] = null;
            let bi = blocks.indexOf(blocksWithPos[cachedPropName]);
            if(bi !== -1){
                blocks.splice(bi, 1);
                delete blocksWithPos[cachedPropName];
            }
        }

        for(let c = 0; c < constants.MAP_WIDTH; c++){
            for(let r = 0; r < constants.MAP_HEIGHT; r++){
                let data = mapData[`${c}-${r}`];
                if(data === null) continue;

                let block = {
                    c: c,
                    r: r,
                    x: c * constants.BLOCK_DIM,
                    y: r * constants.BLOCK_DIM,
                    width: constants.BLOCK_DIM,
                    height: constants.BLOCK_DIM,
                };
                if(!blocksWithPos[`${c}-${r}`]){
                    block.imgName = data.imgName;
                    block.imgElem = data.img;
                    blocks.push(block);
                    blocksWithPos[`${c}-${r}`] = block;
                }
            }
        }

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

        let rays = [];

        rayCount = 0;

        for(let i = constants.RAY_AMOUNT_ONE_SIDE - 1; i > 0; i--){
            rays.push(getAndDrawRays(player.angle + i * constants.RAY_SPACE));
        }

        for(let i = 0; i > (constants.RAY_AMOUNT_ONE_SIDE * -1); i--){
            rays.push(getAndDrawRays(player.angle + i * constants.RAY_SPACE));
        }

        return rays;
    },
    getPlayer(){
        return player;
    },
};

function getAndDrawRays(angle){
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    let rayFromX = player.x + player.width / 2;
    let rayFromY = player.y + player.height / 2;

    let rayToX = rayFromX + cos * 1000;
    let rayToY = rayFromY + sin * 1000;

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
                offset: utils.getDist(blockFromX, blockFromY, rayPoint.x, rayPoint.y) / constants.BLOCK_DIM,
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

    closestDist *= Math.cos(angle - player.angle);

    if((rayCount % constants.RAYS_SKIPPED_TO_DRAW_2D) === 0){
        closestRayPoint.graphicsProps = {
            fromX: rayFromX,
            fromY: rayFromY,
            toX: rayFromX + cos * closestDist,
            toY: rayFromY + sin * closestDist
        };
    }

    rayCount++;

    closestRayPoint.dist = closestDist;

    return closestRayPoint;
}