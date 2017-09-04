var MAX_WALL_LVL = 50000;

var cache = {
    rooms: {
        containersWithEnergy: {},
        spawnsWithEnergy: {},
        constructionSites: {},
        repairStructures: {},
        repairWalls: {},
        sources: {},
        energyContainers: {},
        energyFedStructures: {},
        creeps: {},
        controllers: {},
        carrierFlags: {}
    },
    resetCache: function () {
        this.rooms.containersWithEnergy = {};
        this.rooms.constructionSites = {};
        this.rooms.sources = {};
        this.rooms.energyContainers = {};
        this.rooms.spawnsWithEnergy = {};
        this.rooms.controllers = {};
        this.rooms.repairStructures = {};
        this.rooms.repairWalls = {};
        this.rooms.energyFedStructures = {};
        this.rooms.carrierFlags = {};
        this.rooms.creeps = {};
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
    findCarriersWithEnergy: function (room) {
        var carriers = [];
        for(var i = 0; i < this.getCreepsInRoom(room).length; i++){
            var creep = this.getCreepsInRoom(room)[i];
            if(creep.carry.energy > 0 && creep.memory.role === "carrier"){
                carriers.push(creep);
            }
        }
        return carriers;
    },
    findEmptyCollectors: function (room) {
        var collectors = [];
        for(var i = 0; i < this.getCreepsInRoom(room).length; i++){
            var creep = this.getCreepsInRoom(room)[i];
            if(creep.carry.energy < creep.carryCapacity && creep.memory.role === "collector"){
                collectors.push(creep);
            }
        }
        return collectors;
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

    findRepairWalls: function (room) {
        var repairWalls = {};
        if (typeof this.rooms.repairWalls[room] != "undefined") {
            console.log('findRepairWalls - cached results');
            repairWalls = this.rooms.repairWalls[room];
        } else {
            repairWalls = room.find(FIND_STRUCTURES, {
                filter : (structure) => {
                return (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) && structure.hits < MAX_WALL_LVL;
                }
            });
            this.rooms.repairWalls[room] = repairWalls;
            console.log('findRepairWalls - new results');
        }
        return repairWalls;
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
    getCreepsInRoom(room) {
        if (typeof this.rooms.creeps[room] != "undefined") {
            return this.rooms.creeps[room];
        } else {
            this.rooms.creeps[room] = [];
            for (var i in Game.creeps) {
                var creep = Game.creeps[i];
                if (creep.room.name == room.name)
                    this.rooms.creeps[room].push(creep);
            }
            return this.rooms.creeps[room];
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
