import gameLogic from './game-logic.js';
import drawLogic from './draw-logic.js';
import assetLoader from './asset-loader.js';

let props = await assetLoader.load();
gameLogic.setupGameplay(props.mapCachedPixels, props.mapImgData, props.wallImgPaths);
drawLogic.init(props.wallTextures, props.mapImgData);

const updateWorld = () => {
    drawLogic.drawWorld(gameLogic.handleGameLogic());
    requestAnimationFrame(updateWorld);
}

requestAnimationFrame(updateWorld);