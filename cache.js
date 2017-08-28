var cache = {
    rooms: {containers: {}},
    findContainers: function (room) {
        console.log("findContainers " + this.rooms.containers);
        var containers;
        if (typeof this.rooms.containers[room] != "undefined") {
            containers = this.rooms.containers[room];
        } else {
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
        rooms.containers = {};
    }
}

module.exports = cache;