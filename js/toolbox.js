let activeItem = null;

export default {
    setup(wallTextures){
        let divToolbox = document.createElement('div');
        divToolbox.classList.add('toolbox');
        document.body.append(divToolbox);
        
        let items = [];

        Object.keys(wallTextures).forEach((imgName, index) => {
            let divItem = document.createElement('div');
            divItem.classList.add('item');
            
            let img = document.createElement('img');
            img.setAttribute('src', wallTextures[imgName].imgData.dataURL);
            divItem.append(img);
    
            divToolbox.append(divItem);

            let item = {
                imgName: imgName,
                elem: divItem,
                img: img,
            };

            items.push(item);
            if(index === 0) setItemActive(item);

            divItem.addEventListener('click', e => {
                setItemActive(items.find(item => item.elem === e.currentTarget));
            });

            function setItemActive(targetItem){
                items.forEach(item => {
                    item.elem.classList.remove('active');
                    item.elem.classList[item === targetItem ? 'add' : 'remove']('active');
                });
                activeItem = targetItem;
            }
        });
    },
    getActiveItem(){
        return activeItem;
    },
}