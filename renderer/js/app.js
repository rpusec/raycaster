import gameLogic from './game-logic.js';
import drawLogic from './draw-logic.js';
import assetLoader from './asset-loader.js';
import toolbox from './toolbox.js';
import titleBar from './title-bar.js';

(async () => {
    let props = await assetLoader.load();
    
    titleBar.init();
    toolbox.setup(props.wallTextures);
    gameLogic.setupGameplay(props.wallTextures);
    drawLogic.init(props.wallTextures, props.floorTextures);
    
    const updateWorld = () => {
        drawLogic.drawWorld(gameLogic.handleGameLogic());
        requestAnimationFrame(updateWorld);
    }
    
    requestAnimationFrame(updateWorld);
})();
