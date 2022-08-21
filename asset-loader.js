export default {
    async load(){
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

        function getImageContext(url) {
            return new Promise(resolve => {
                var img = new Image();
                img.src = url;
                img.crossOrigin = "Anonymous";
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                img.onload = () => {
                    canvas.setAttribute('width', img.width + 'px');
                    canvas.setAttribute('height', img.height + 'px');
                    context.drawImage(img, 0, 0);
                    resolve({
                        width: img.width,
                        height: img.height,
                        context: context,
                        dataURL: canvas.toDataURL('image/png'),
                    });
                }
            });
        }

        return {wallTextures};
    }
}