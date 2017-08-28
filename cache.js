var cache = {
    rooms: {containers: {},
            constructionSites: {}},
    findContainers: function (room) {
        var containers = {};
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
        this.rooms.containers = {};
        this.rooms.constructionSites = {};
    },
    findConstructionSites: function(room){
        var constructionSites = {};

        if (typeof this.rooms.constructionSites[room] != "undefined") {
            constructionSites = this.rooms.constructionSites[room];
        } else {
            constructionSites = room.find(FIND_CONSTRUCTION_SITES);
            this.rooms.constructionSites[room] = constructionSites;
        }
        return constructionSites;
    }
}

module.exports = cache;