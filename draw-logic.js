import constants from "./constants.js";
import gameLogic from "./game-logic.js";

let screenDim = null, ctx = null, ctx3d = null;
let wallTextures;

export default {
    init(_wallTextures, mapImgData){
        wallTextures = _wallTextures;

        screenDim = {
            width: mapImgData.width * constants.BLOCK_DIM,
            height: mapImgData.height * constants.BLOCK_DIM,
        };

        let canvases = gameLogic.getCanvases();

        canvases.canvas2d.setAttribute('width', screenDim.width);
        canvases.canvas2d.setAttribute('height', screenDim.height);

        canvases.canvas3d.setAttribute('width', screenDim.width);
        canvases.canvas3d.setAttribute('height', screenDim.height);

        ctx = canvases.canvas2d.getContext('2d');
        ctx3d = canvases.canvas3d.getContext('2d');
    },
    drawWorld(rays){
        let player = gameLogic.getPlayer();

        ctx.clearRect(0, 0, screenDim.width, screenDim.height);
        ctx.fillStyle = "#000000";

        gameLogic.getBlocks().forEach(block => ctx.fillRect(block.x, block.y, block.width, block.height));

        let mouseSel = gameLogic.getMouseSelCoord();
        ctx.strokeStyle = "#FF0000";
        ctx.beginPath();
        ctx.rect(mouseSel.x, mouseSel.y, constants.BLOCK_DIM, constants.BLOCK_DIM);
        ctx.stroke();

        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, constants.BLOCK_DIM / 2, 0, Math.PI * 2);
        ctx.fill();

        rays.every(ray => {
            if(!ray.graphicsProps) return true;

            ctx.strokeStyle = "#00FF00";
            ctx.beginPath();
            ctx.moveTo(ray.graphicsProps.fromX, ray.graphicsProps.fromY);
            ctx.lineTo(ray.graphicsProps.toX, ray.graphicsProps.toY);
            ctx.stroke();
            ctx.fill();

            return true;
        });

        draw3d(rays);
    }
}

function draw3d(rays){
    ctx3d.clearRect(0, 0, screenDim.width, screenDim.height);

    let maxSegmentWidth = screenDim.width / rays.length;

    rays.every((ray, index) => {
        if(!ray.point) return true;

        let segmentWidth = maxSegmentWidth;

        let segmentHeight = (constants.BLOCK_DIM / ray.dist) * screenDim.width;
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
        if(shadowPerc > constants.MAX_SHADOW_PERC) shadowPerc = constants.MAX_SHADOW_PERC;

        ctx3d.fillStyle = `rgba(0, 0, 0, ${shadowPerc})`;
        ctx3d.fillRect(x, y, width, height);

        return true;
    });
}