export default {
    setup(wallTextures){
        let divToolbox = document.createElement('div');
        divToolbox.classList.add('toolbox');
        document.body.append(divToolbox);
        
        let items = [];

        Object.keys(wallTextures).forEach(imgName => {
            let divItem = document.createElement('div');
            divItem.classList.add('item');
    
            let img = document.createElement('img');
            img.setAttribute('src', wallTextures[imgName].imgData.dataURL);
            divItem.append(img);
    
            divToolbox.append(divItem);

            items.push(divItem);

            divItem.addEventListener('click', e => {
                items.forEach(item => {
                    item.classList.remove('active');
                    item.classList[e.currentTarget === item ? 'add' : 'remove']('active');
                });
            });
        });
    }
}