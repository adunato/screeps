var cache = {
    rooms: {
        containersWithEnergy: {},
        spawnsWithEnergy: {},
        constructionSites: {},
        repairStructures: {},
        sources: {},
        energyContainers: {},
        energyFedStructures: {},
        creeps: {},
        controllers: {}
    },
    resetCache: function () {
        this.rooms.containersWithEnergy = {};
        this.rooms.constructionSites = {};
        this.rooms.sources = {};
        this.rooms.energyContainers = {};
        this.rooms.spawnsWithEnergy= {};
        this.rooms.controllers = {};
        this.rooms.repairStructures = {};
        this.energyFedStructures = {};
        this.creeps = {};
    },
    findContainersWithEnergy: function (room) {
        var containers = {};
        if (typeof this.rooms.containersWithEnergy[room] != "undefined") {
            containers = this.rooms.containersWithEnergy[room];
        } else {
            containers = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy > 0;
                }
            });
            this.rooms.containersWithEnergy[room] = containers;
        }
        return containers;
    },
    findSpawnWithEnergy: function (room) {
        var spawnsWithEnergy = {};
        if (typeof this.rooms.spawnsWithEnergy[room] != "undefined") {
            spawnsWithEnergy = this.rooms.spawnsWithEnergy[room];
        } else {
            spawnsWithEnergy = room.find(FIND_MY_SPAWNS, {
                filter: (spawn) => {
                    return spawn.energy > 0;
                }
            });
            this.rooms.spawnsWithEnergy[room] = spawnsWithEnergy;
        }
        return spawnsWithEnergy;
    },
    findConstructionSites: function (room) {
        var constructionSites = {};

        if (typeof this.rooms.constructionSites[room] != "undefined") {
            constructionSites = this.rooms.constructionSites[room];
        } else {
            constructionSites = room.find(FIND_CONSTRUCTION_SITES);
            this.rooms.constructionSites[room] = constructionSites;
        }
        return constructionSites;
    },
    findRepairStructures: function (room) {
        var repairStructures = {};

        if (typeof this.rooms.repairStructures[room] != "undefined") {
            repairStructures = this.rooms.repairStructures[room];
        } else {
            repairStructures = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax;
                }
            });
            this.rooms.repairStructures[room] = repairStructures;
        }
        return repairStructures;
    },
    findSources: function (room) {
        var sources = {};

        if (typeof this.rooms.sources[room] != "undefined") {
            sources = this.rooms.sources[room];
        } else {
            sources = room.find(FIND_SOURCES);
            this.rooms.sources[room] = sources;
        }
        return sources;
    },
    findEnergyContainers: function (room) {
        var energyDropStructures = {};

        if (typeof this.rooms.energyContainers[room] != "undefined") {
            energyDropStructures = this.rooms.energyContainers[room];
        } else {
            energyDropStructures = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity;
                    return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy < container.storeCapacity;
                }

            });
            this.rooms.energyContainers[room] = energyDropStructures;
        }
        return energyDropStructures;
    },
    findEnergyFedStructures: function (room) {
        var energyFedStructures = {};

        if (typeof this.rooms.energyFedStructures[room] != "undefined") {
            energyFedStructures = this.rooms.energyFedStructures[room];
        } else {
            energyFedStructures = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            this.rooms.energyFedStructures[room] = energyFedStructures;
        }
        return energyFedStructures;
    },
    getFlagRoomName: function (flagName) {
        var flagRoom = Game.flags[flagName].room;
        //room is not visible
        if (typeof flagRoom == 'undefined') {
            return 'undefined';
        } else {
            return flagRoom.name;
        }
    },
    getFlagRoom: function (flagName) {
        return flagRoom = Game.flags[flagName].room;
    },
    countCreepsInFlagRoom: function (flagName) {
        var room = this.getFlagRoom(flagName);
        var creeps = this.getCreepsInRoom(room);
        return creeps.length;
    },
    getCreepsInRoom(room){
        if (typeof this.rooms.creeps[room] != "undefined") {
            return this.rooms.creeps[room];
        } else {
            this.rooms.creeps = {};
            for (var i in Game.creeps) {
                var creep = Game.creeps[i];
                if (creep.room.name == this.getFlagRoomName(flagName))
                    this.rooms.creeps.add(creep);
            }
            return this.rooms.creeps;
        }
    },
    selectHarvestRoom: function (flagName) {
        var harvestRoom = Game.flags[flagName].room;
        //room is not visible
        if (typeof harvestRoom == 'undefined') {
            creep.moveTo(Game.flags[flagName], {visualizePathStyle: {stroke: '#ffaa00'}});
        } else {
            var sources = harvestRoom.find(FIND_SOURCES);
            var selectedSource;
            var maxEnergy = 0;
            for (var i = 0; i < sources.length; i++) {
                if (sources[i].energy > maxEnergy) {
                    selectedSource = sources[i];
                    maxEnergy = sources[i].energy;
                }
            }
            creep.memory.selectedSource = selectedSource.id;
        }
    }


};

module.exports = cache;
