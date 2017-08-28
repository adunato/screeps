var cache = {
    rooms: {containers: {}},
    findContainers: function (room) {
        var containers;
        if (typeof room.containers[room] != "undefined") {
            containers = room.containers[room];
        } else {
            containers = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy > 0;
                }
            });
            room.containers[room] = containers;
        }
        return containers;
    },
    resetCache: function(){
        rooms.containers = {};
    }
}

module.exports = cache;