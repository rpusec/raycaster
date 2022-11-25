export default {
    getRayPoint(args){
        if(this.lineLine.apply(this, args)) return this.getLineLineInsertionPoint.apply(this, args);
        return null;
    },
    lineLine(x1, y1, x2, y2, x3, y3, x4, y4){
        var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
    },
    getLineLineInsertionPoint(x1, y1, x2, y2, x3, y3, x4, y4){
        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false
        }
    
        var denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
    
        // Lines are parallel
        if (denominator === 0) {
            return false
        }
    
        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
    
        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false
        }
    
        // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1)
        let y = y1 + ua * (y2 - y1)
    
        return {x, y}
    },
    getDist(x1, y1, x2, y2){
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    },
    playerBlockCollision(player, b){
        return (
            player.x < b.x + b.width &&
            player.x + player.width > b.x &&
            player.y < b.y + b.height &&
            player.height + player.y > b.y
        );
    },
    pointBlockColl(px, py, b){
        return px > b.x && px < b.x + b.width && py > b.y && py < b.y + b.height;
    },
    getCollisionInnerRect(playerPos, block){
        let rectInner = {};
    
        //top
        if(this.pointBlockColl(playerPos.x, playerPos.y + playerPos.height, block) && this.pointBlockColl(playerPos.x + playerPos.width, playerPos.y + playerPos.height, block)){
            rectInner.x = playerPos.x;
            rectInner.y = block.y;
            rectInner.width = playerPos.width;
            rectInner.height = playerPos.y + playerPos.height - block.y;
        }
        //bottom
        else if(this.pointBlockColl(playerPos.x, playerPos.y, block) && this.pointBlockColl(playerPos.x + playerPos.width, playerPos.y, block)){
            rectInner.x = playerPos.x;
            rectInner.y = playerPos.y;
            rectInner.width = playerPos.width;
            rectInner.height = block.y + block.height - playerPos.y;
        }
        //right
        else if(this.pointBlockColl(playerPos.x, playerPos.y, block) && this.pointBlockColl(playerPos.x, playerPos.y + playerPos.height, block)){
            rectInner.x = playerPos.x;
            rectInner.y = playerPos.y;
            rectInner.width = block.x + block.width - playerPos.x;
            rectInner.height = playerPos.height;
        }
        //left
        else if(this.pointBlockColl(playerPos.x + playerPos.width, playerPos.y, block) && this.pointBlockColl(playerPos.x + playerPos.width, playerPos.y + playerPos.height, block)){
            rectInner.x = block.x;
            rectInner.y = playerPos.y;
            rectInner.width = playerPos.x + playerPos.width - block.x;
            rectInner.height = playerPos.height;
        }
        //top right
        else if(this.pointBlockColl(playerPos.x, playerPos.y + playerPos.height, block)){
            rectInner.x = playerPos.x;
            rectInner.y = block.y;
            rectInner.width = block.x + block.width - playerPos.x;
            rectInner.height = playerPos.y + playerPos.height - block.y;
        }
        //top left
        else if(this.pointBlockColl(playerPos.x + playerPos.width, playerPos.y + playerPos.height, block)){
            rectInner.x = block.x;
            rectInner.y = block.y;
            rectInner.width = playerPos.x + playerPos.width - block.x;
            rectInner.height = playerPos.y + playerPos.height - block.y;
        }
        //bottom right
        else if(this.pointBlockColl(playerPos.x, playerPos.y, block)){
            rectInner.x = playerPos.x;
            rectInner.y = playerPos.y;
            rectInner.width = block.x + block.width - playerPos.x;
            rectInner.height = block.y + block.height - playerPos.y;
        }
        //bottom left
        else if(this.pointBlockColl(playerPos.x + playerPos.width, playerPos.y, block)){
            rectInner.x = block.x;
            rectInner.y = playerPos.y;
            rectInner.width = playerPos.x + playerPos.width - block.x;
            rectInner.height = block.y + block.height - playerPos.y;
        }
        else rectInner = null;
    
        return rectInner;
    }
};