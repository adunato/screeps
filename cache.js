var cache = {
    rooms: {containers: {}},
    findContainers: function (room) {
        var containers = {};
        if (typeof this.rooms.containers[room] != "undefined") {
            console.log("reuse cache for " + room.name);
            containers = this.rooms.containers[room];
        } else {
            console.log("new cache for " + room.name);
            containers = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy > 0;
                }
            });
            this.rooms.containers[room] = containers;
        }
        return containers;
    },
    resetCache: function(){
        this.rooms.containers = {};
    }
}

module.exports = cache;