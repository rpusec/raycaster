export default {
    async load(){
        let texturePaths = [
            {
                imgName: 'wood.png',
                wall: true,
            },
            {
                imgName: 'brick.png',
                wall: true,
            },
            {
                imgName: 'steel.png',
                wall: true,
            },
            {
                imgName: 'floor.png',
                wall: false,
            },
        ];

        let wallTextures = {}, floorTextures = {};

        for(let item of texturePaths){
            let imgData = await getImageContext(`assets/${item.imgName}`);
            let data = {
                imgData: imgData,
                cachedPixels: cacheImgData(imgData),
            };
            if(item.wall) wallTextures[item.imgName] = data;
            else floorTextures[item.imgName] = data;
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
                    let dataURL = canvas.toDataURL('image/png');
                    resolve({
                        width: img.width,
                        height: img.height,
                        context: context,
                        dataURL: dataURL,
                        imgElem: (() => {
                            let elem = document.createElement('img');
                            elem.setAttribute('src', dataURL);
                            return elem;
                        })(),
                    });
                }
            });
        }

        return {wallTextures, floorTextures};
    }
}