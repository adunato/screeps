var cache = {
    rooms: {containers: {},
            constructionSites: {},
            sources: {},
            energyDropStructures: {}},
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
        this.rooms.sources = {};
        this.rooms.energyDropStructures = {};
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
    },
    findSources: function(room){
        var sources = {};

        if (typeof this.rooms.sources[room] != "undefined") {
            sources = this.rooms.sources[room];
        } else {
            sources = room.find(FIND_SOURCES);
            this.rooms.sources[room] = sources;
        }
        return sources;
    },
    findEnergyDropStructures: function(room){
        var energyDropStructures = {};

        if (typeof this.rooms.energyDropStructures[room] != "undefined") {
            energyDropStructures = this.rooms.energyDropStructures[room];
        } else {
            energyDropStructures = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_CONTAINER) && structure.energy < structure.energyCapacity;
                }
            });
            this.rooms.energyDropStructures[room] = energyDropStructures;
        }
        return energyDropStructures;
    }

}

module.exports = cache;
