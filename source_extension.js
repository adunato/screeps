//var cache = require('cache');
Source.prototype.getAvailableWithdrawingSlots = function () {
    var count = this.getWithdrawingSlots();
    for(var creepName in Game.creeps){
        var creep = Game.creeps[creepName];
        if(creep.memory.selectedSource === this.id){
            count --;
        }
    }
};

Source.prototype.getWithdrawingSlots = function () {
    var count=0
    var x = this.pos.x;
    var y = this.pos.y;
    if(Game.map.getTerrainAt(x+1,y,this.pos.roomName) != 'wall')
        count++;
    if(Game.map.getTerrainAt(x+1,y+1,this.pos.roomName) != 'wall')
        count++;
    if(Game.map.getTerrainAt(x+1,y-1,this.pos.roomName) != 'wall')
        count++;
    if(Game.map.getTerrainAt(x,y+1,this.pos.roomName) != 'wall')
        count++;
    if(Game.map.getTerrainAt(x,y-1,this.pos.roomName) != 'wall')
        count++;
    if(Game.map.getTerrainAt(x-1,y,this.pos.roomName) != 'wall')
        count++;
    if(Game.map.getTerrainAt(x-1,y+1,this.pos.roomName) != 'wall')
        count++;
    if(Game.map.getTerrainAt(x-1,y-1,this.pos.roomName) != 'wall')
        count++;
};

