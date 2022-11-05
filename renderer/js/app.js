import gameLogic from './game-logic.js';
import drawLogic from './draw-logic.js';
import assetLoader from './asset-loader.js';
import toolbox from './toolbox.js';

let props = await assetLoader.load();

toolbox.setup(props.wallTextures);
gameLogic.setupGameplay(props.wallTextures);
drawLogic.init(props.wallTextures, props.floorTextures);

const updateWorld = () => {
    drawLogic.drawWorld(gameLogic.handleGameLogic());
    requestAnimationFrame(updateWorld);
}

requestAnimationFrame(updateWorld);