const DROP_CONTAINER = "DROP_CONTAINER";
const DROP_STRUCTURE = "DROP_STRUCTURE";
const DROP_COLLECTOR = "DROP_COLLECTOR";
const DROP_CARRIER = "DROP_CARRIER";
const DROP_STORAGE = "DROP_STORAGE";
const MIN_ENERGY_CONTAINER_STORAGE = 0;
const MIN_LINK_STORAGE = 0;
var repairBlacklist = ['59c05e4bc575336ca416c8f5'];
var MAX_WALL_LVL = 100000;
var cacheAge = 0;
var CACHE_AGE_LIMIT = 0;

var cache = {
    rooms: {
        containersWithEnergy: {},
        linksWithEnergy: {},
        links: {},
        spawnsWithEnergy: {},
        constructionSites: {},
        repairStructures: {},
        repairWalls: {},
        repairRamparts: {},
        sources: {},
        energyContainers: {},
        storage: {},
        energyFedStructures: {},
        creeps: {},
        controllers: {},
        carrierFlags: {},
        containers: {},
        towers: {},
        hostileCreeps : {},
        emptyExtensions: {},
        spawns: {},
        minerals: {},
        extractors: {},
        structures: {},
        droppedResources: {},
    },
    resetCache: function () {
        cacheAge++;
        if (cacheAge > CACHE_AGE_LIMIT) {
            cacheAge = 0;
            this.rooms.containersWithEnergy = {};
            this.rooms.linksWithEnergy = {};
            this.rooms.constructionSites = {};
            this.rooms.sources = {};
            this.rooms.energyContainers = {};
            this.rooms.spawnsWithEnergy = {};
            this.rooms.controllers = {};
            this.rooms.repairStructures = {};
            this.rooms.repairWalls = {};
            this.rooms.repairRamparts = {};
            this.rooms.energyFedStructures = {};
            this.rooms.carrierFlags = {};
            this.rooms.creeps = {};
            this.rooms.containers = {};
            this.rooms.storage = {};
            this.rooms.towers = {};
            this.rooms.hostileCreeps = {};
            this.rooms.emptyExtensions = {};
            this.rooms.spawns = {};
            this.rooms.creeps = {};
            this.rooms.links = {};
            this.rooms.minerals = {};
            this.rooms.extractors = {};
            this.rooms.structures = {};
            this.rooms.droppedResources = {};
        }
    },
    getStoredEnergy: function (room) {
        const containers = this.findContainersWithEnergy(room);
        const container_energy = _.sum(containers, c => c.store.energy);
        return container_energy;
    },
    findContainersWithEnergy: function (room) {
        var containers = [];
        if(!room)
            return containers;
        if (typeof this.rooms.containersWithEnergy[room] != "undefined") {
            containers = this.rooms.containersWithEnergy[room];
        } else {
            containers = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    return (container.structureType == STRUCTURE_CONTAINER || container.structureType == STRUCTURE_STORAGE) && container.store.energy > MIN_ENERGY_CONTAINER_STORAGE;
                }
            });
            this.rooms.containersWithEnergy[room] = containers;
        }
        return containers;
    },
    findExtractors: function (room) {
        var extractors = [];
        if(!room)
            return extractors;
        if (typeof this.rooms.extractors[room] != "undefined") {
            extractors = this.rooms.extractors[room];
        } else {
            extractors = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    return (container.structureType == STRUCTURE_EXTRACTOR);
                }
            });
            this.rooms.extractors[room] = extractors;
        }
        return extractors;
    },
    findDroppedResources: function (room) {
        var droppedResources = [];
        if(!room)
            return droppedResources;
        if (typeof this.rooms.droppedResources[room] != "undefined") {
            droppedResources = this.rooms.droppedResources[room];
        } else {
            droppedResources = room.find(FIND_DROPPED_RESOURCES);
            this.rooms.droppedResources[room] = droppedResources;
        }
        return droppedResources;
    },
    findStructures: function (room) {
        var structures = [];
        if(!room)
            return structures;
        if (typeof this.rooms.structures[room] != "undefined") {
            structures = this.rooms.structures[room];
        } else {
            structures = room.find(FIND_STRUCTURES);
            this.rooms.structures[room] = structures;
        }
        return structures;
    },
    findStructures: function (room, structureType) {
        var structures = this.findStructures();
        var ret = [];
        for(var structure in structures) {
            if(structure.structureType === structureType)
                ret.push(structure);
        }
        return ret;
    },
    findHostileCreeps: function (room) {
        var enemyCreeps = [];
        if(!room)
            return enemyCreeps;
        if (typeof this.rooms.hostileCreeps[room] != "undefined") {
            enemyCreeps = this.rooms.hostileCreeps[room];
        } else {
            enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
            this.rooms.hostileCreeps[room] = enemyCreeps;
        }
        return enemyCreeps;
    },
    findCreeps: function (room) {
        var creeps = [];
        if(!room)
            return creeps;
        if (typeof this.rooms.creeps[room] != "undefined") {
            creeps = this.rooms.creeps[room];
        } else {
            creeps = room.find(FIND_CREEPS);
            this.rooms.creeps[room] = creeps;
        }
        return creeps;
    },
    findObjectsWithEnergy: function (room, includeCarriers, includeLinks) {
        if(!room)
            return [];
        var containers = this.findContainersWithEnergy(room);
        var carriers = includeCarriers ? this.findCarriersWithEnergy(room) : [];
        var collectors = this.findCollectorsWithEnergy(room);
        var harvesters = this.findHarvestersWithEnergy(room);
        var links = includeLinks ? this.findLinks(room) : [];
        var energySources = containers.concat(carriers).concat(collectors).concat(harvesters).concat(links);
        return energySources;
    },
    findLinksWithEnergy: function (room) {
        if(!room)
            return [];
        var links = this.rooms.linksWithEnergy[room] ? this.rooms.linksWithEnergy[room] : this.rooms.linksWithEnergy[room] = room.find(FIND_STRUCTURES, {
            filter: (link) => {
                return (link.structureType == STRUCTURE_LINK && link.energy > 0);
            }
        });
        return links;
    },
    findLinks: function (room) {
        if(!room)
            return [];
        var links = this.rooms.links[room] ? this.rooms.links[room] : this.rooms.links[room] = room.find(FIND_STRUCTURES, {
            filter: (link) => {
                return (link.structureType == STRUCTURE_LINK );
            }
        });
        return links;
    },
    findMinerals: function (room) {
        if(!room)
            return [];
        var minerals = this.rooms.minerals[room] ? this.rooms.minerals[room] : this.rooms.minerals[room] = room.find(FIND_MINERALS);
        return minerals;
    },
    findContainers: function (room) {
        var containers = {};
        if (typeof this.rooms.containers[room] != "undefined") {
            containers = this.rooms.containers[room];
        } else {
            containers = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    return (container.structureType == STRUCTURE_CONTAINER);
                }
            });
            this.rooms.containers[room] = containers;
        }
        return containers;
    },
    findEmptyStorage: function (room) {
        var storage = {};
        if (typeof this.rooms.storage[room] != "undefined") {
            storage = this.rooms.storage[room];
        } else {
            storage = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE);
                }
            });
            this.rooms.storage[room] = storage;
        }
        return storage;
    },
    findSourceContainersWithEnergy: function (containersGroup, minQuantityPc) {
        var containers = [];
        if (!global.sourceContainers[containersGroup])
            return containers;
        for (var i = 0; i < global.sourceContainers[containersGroup].length; i++) {
            var container = Game.getObjectById(global.sourceContainers[containersGroup][i])
            if (container && (container instanceof StructureContainer || container instanceof StructureStorage) && _.sum(container.store) > (container.storeCapacity / 100 * minQuantityPc))
                containers.push(container);
        }
        return containers;
    },
    findSourceLinksWithEnergy: function (containersGroup, minQuantityPc) {
        var links = [];
        if (!global.sourceContainers[containersGroup])
            return links;
        for (var i = 0; i < global.sourceContainers[containersGroup].length; i++) {
            var link = Game.getObjectById(global.sourceContainers[containersGroup][i])
            if (link && link instanceof StructureLink) {
                if (link.energy > (link.energyCapacity / 100 * minQuantityPc)
                )
                    links.push(link);
            }
        }
        return links;
    },
    findEmptyDestinationContainers: function (containersGroup, maxQuantityPc) {
        var containers = [];
        if (!global.destinationContainers[containersGroup])
            return containers;
        for (var i = 0; i < global.destinationContainers[containersGroup].length; i++) {
            var container = Game.getObjectById(global.destinationContainers[containersGroup][i])
            if (container && (container instanceof StructureContainer || container instanceof StructureStorage) && _.sum(container.store) < (container.storeCapacity / 100 * maxQuantityPc))
                containers.push(container);
        }
        return containers;
    },
    findEmptyDestinationLinks: function (containersGroup, maxQuantityPc) {
        var links = [];
        if (!global.destinationContainers[containersGroup])
            return links;
        for (var i = 0; i < global.destinationContainers[containersGroup].length; i++) {
            var link = Game.getObjectById(global.destinationContainers[containersGroup][i])
            if (link && link instanceof StructureLink && link.energy < (link.energyCapacity / 100 * maxQuantityPc))
                links.push(link);
        }
        return links;
    },
    isContainerSource: function (containersGroup, container) {
        for (var i = 0; i < global.sourceContainers[containersGroup].length; i++) {
            if (container.id === global.sourceContainers[containersGroup][i])
                return true;
        }
        return false;
    },
    findCarriersWithEnergy: function (room) {
        var carriers = [];
        for (var i = 0; i < this.getCreepsInRoom(room).length; i++) {
            var creep = this.getCreepsInRoom(room)[i];
            if (creep.carry.energy > 0 && creep.memory.role === "carrier") {
                carriers.push(creep);
            }
        }
        return carriers;
    },
    findCollectorsWithEnergy: function (room) {
        var carriers = [];
        for (var i = 0; i < this.getCreepsInRoom(room).length; i++) {
            var creep = this.getCreepsInRoom(room)[i];
            if (creep.carry.energy > 0 && creep.memory.role === "collector") {
                carriers.push(creep);
            }
        }
        return carriers;
    },
    findHarvestersWithEnergy: function (room) {
        var carriers = [];
        for (var i = 0; i < this.getCreepsInRoom(room).length; i++) {
            var creep = this.getCreepsInRoom(room)[i];
            if (creep.carry.energy > 0 && creep.memory.role === "harvester") {
                carriers.push(creep);
            }
        }
        return carriers;
    },
    findEmptyCollectors: function (room) {
        var collectors = [];
        for (var i = 0; i < this.getCreepsInRoom(room).length; i++) {
            var creep = this.getCreepsInRoom(room)[i];
            if (creep.carry.energy < creep.carryCapacity && creep.memory.role === "collector") {
                collectors.push(creep);
            }
        }
        return collectors;
    },
    findEmptyCarriers: function (room) {
        var carriers = [];
        for (var i = 0; i < this.getCreepsInRoom(room).length; i++) {
            var creep = this.getCreepsInRoom(room)[i];
            if (creep.carry.energy < creep.carryCapacity && creep.memory.role === "carrier") {
                carriers.push(creep);
            }
        }
        return carriers;
    },
    findSpawnsWithEnergy: function (room) {
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
    findRepairStructures: function (room, minRepairLevelPc) {
        var repairStructures = {};

        if (typeof this.rooms.repairStructures[room] != "undefined") {
            repairStructures = this.rooms.repairStructures[room];
        } else {
            repairStructures = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < (structure.hitsMax / 100 * minRepairLevelPc) && structure.structureType !== STRUCTURE_WALL && structure.structureType !== STRUCTURE_RAMPART && !_.includes(repairBlacklist, structure.id);
                }
            });
            this.rooms.repairStructures[room] = repairStructures;
        }
        return repairStructures;
    },

    findEmptyExtensions: function (room) {
        var emptyExtensions = {};

        if (typeof this.rooms.emptyExtensions[room] != "undefined") {
            emptyExtensions = this.rooms.emptyExtensions[room];
        } else {
            emptyExtensions = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
                }
            });
            this.rooms.emptyExtensions[room] = emptyExtensions;
        }
        return emptyExtensions;
    },

    findSpawns: function (room) {
        var spawns = {};

        if (typeof this.rooms.spawns[room] != "undefined") {
            spawns = this.rooms.spawns[room];
        } else {
            spawns = room.find(FIND_MY_SPAWNS);
            this.rooms.spawns[room] = spawns;
        }
        return spawns;
    },

    findRepairWalls: function (room) {
        var repairWalls = {};
        if (typeof this.rooms.repairWalls[room] != "undefined") {
            repairWalls = this.rooms.repairWalls[room];
        } else {
            repairWalls = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) && structure.hits < MAX_WALL_LVL;
                }
            });
            this.rooms.repairWalls[room] = repairWalls;
        }
        return repairWalls;
    },
    findRepairRamparts: function (room) {
        var repairRamparts = {};
        if (typeof this.rooms.repairRamparts[room] != "undefined") {
            repairRamparts = this.rooms.repairRamparts[room];
        } else {
            repairRamparts = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_RAMPART) && structure.hits < MAX_WALL_LVL;
                }
            });
            this.rooms.repairRamparts[room] = repairRamparts;
        }
        return repairRamparts;
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
                    return (container.structureType == STRUCTURE_CONTAINER) && _.sum(container.store) < container.storeCapacity;
                }

            });
            this.rooms.energyContainers[room] = energyDropStructures;
        }
        return energyDropStructures;
    },
    findEmptyPlaceToDropStuff: function (room, options) {
        var targets = [];
        if (options[DROP_CONTAINER]) {
            var containers = cache.findEnergyContainers(room);
            targets = targets.concat(containers);
        }
        if (options[DROP_COLLECTOR]) {
            var collectors = cache.findEmptyCollectors(room)
            targets = targets.concat(collectors);
        }
        if (options[DROP_STRUCTURE]) {
            var energyStructures = cache.findEnergyFedStructures(room, false);
            targets = targets.concat(energyStructures);
        }
        if (options[DROP_CARRIER]) {
            var carriers = cache.findEmptyCarriers(room);
            targets = targets.concat(carriers);
        }
        if (options[DROP_CARRIER]) {
            var carriers = cache.findEmptyCarriers(room);
            targets = targets.concat(carriers);
        }
        return targets;
    },

    getLinksToFeed: function(room){
        var ret = [];
        for(var key in global.linksToFeed[room.name]){
            var link = Game.getObjectById(global.linksToFeed[room.name][key]);
            if(link)
                ret.push(link);
        }
        return ret;
    },

    findEnergyFedStructures_: function (room) {
        var includeTowers = true;
        var energyFedStructures = this.rooms.energyFedStructures[room] ? this.rooms.energyFedStructures[room] : this.rooms.energyFedStructures[room] = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN
                    || (includeTowers && structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity * 0.9));
            }
        });
        energyFedStructures = energyFedStructures.concat(this.getLinksToFeed(room));
        var ret = [];
        for (var i in energyFedStructures) {
            var structure = energyFedStructures[i];
            if (structure.energy < structure.energyCapacity) {
                ret.push(structure);
            }
        }
        return ret;
    },


    findEnergyFedStructures: function (room, includeTowers) {
        var energyFedStructures = this.findEnergyFedStructures_(room);
        energyFedStructures = energyFedStructures.concat(this.getLinksToFeed(room));
        var ret = [];
        for (var i in energyFedStructures) {
            var structure = energyFedStructures[i];
            if (structure.energy < structure.energyCapacity && (structure.structureType != STRUCTURE_TOWER || includeTowers)) {
                ret.push(structure);
            }
        }
        return ret;
    },
    findEmptyTowers: function (room, minQuantityPc) {
        var towers = this.findTowers(room);
        var ret = [];
        for (var i in towers) {
            var tower = towers[i];
            if (tower.energy < (tower.energyCapacity / 100 * minQuantityPc)) {
                ret.push(tower);
            }
        }
        return ret;
    },
    findTowers: function (room) {
        var towers = {};

        if (this.rooms.towers[room] && this.rooms.towers[room].length > 0) {
            towers = this.rooms.towers[room];
        } else {
            towers = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_TOWER);
                }
            });
            this.rooms.towers[room] = towers;
        }
        return towers;
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
        if(!room)
            return [];
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
