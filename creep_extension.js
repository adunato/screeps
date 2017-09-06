const DROP_CONTAINER = "DROP_CONTAINER";
const DROP_STRUCTURE = "DROP_STRUCTURE";
const DROP_COLLECTOR = "DROP_COLLECTOR";
var cache = require('cache');
require('source_extension');
Creep.prototype.withdrawEnergy = function () {
    var containers = cache.findContainersWithEnergy(this.room);
    var carriers = cache.findCarriersWithEnergy(this.room);
    var energySources = containers.concat(carriers);
    if (energySources.length > 0) {
        var energySource = this.getNearestObjectByDistance(energySources);
        if (!energySource)
            return;
        if (energySource.transfer(this, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(energySource, {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};
Creep.prototype.withdrawEnergyFromSources = function (energySources) {
    if (energySources.length > 0) {
        var energySource = this.getNearestObjectByDistance(energySources);
        if (!energySource)
            return;
        if (energySource.transfer(this, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(energySource, {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.withdrawEnergyExCarriers = function () {
    var containers = cache.findContainersWithEnergy(this.room);
    return this.withdrawEnergyFromSources(containers);
};

Creep.prototype.withdrawEnergyFromSourceContainer = function (minQuantity) {
    var containers = cache.findSourceContainersWithEnergy(this.room,minQuantity);
    return this.withdrawEnergyFromSources(containers);
};

Creep.prototype.withdrawEnergyFromCarrier = function () {
    var carriers = cache.findCarriersWithEnergy(this.room);
    return this.withdrawEnergyFromSources(carriers);
};

Creep.prototype.withdrawEnergyFromSpawn = function () {
    var spawns = cache.findSpawnWithEnergy(this.room);
    if (spawns.length > 0) {
        if (this.withdraw(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(spawns[0], {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.dropToDestinations = function (destinations) {
    if (destinations.length > 0) {
        var structure = this.getNearestObjectByDistance(destinations);
        if (!structure)
            return;
        if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(structure, {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.dropToDestinationContainer = function () {
    this.memory.selectedSource = null;
    var structures = cache.findEmptyDestinationContainers(this.room);
    return this.dropToDestinations(structures);
};

Creep.prototype.dropEnergy = function (options) {
    this.memory.selectedSource = null;
    var targets = [];
    if(options[DROP_CONTAINER]) {
        var containers = cache.findEnergyContainers(this.room);
        targets = targets.concat(containers);
    }
    if(options[DROP_COLLECTOR]) {
        var collectors = cache.findEmptyCollectors(this.room)
        targets = targets.concat(collectors);
    }
    if(options[DROP_STRUCTURE]) {
        var energyStructures = cache.findEnergyFedStructures(this.room, false);
        targets = targets.concat(energyStructures);
    }
    return this.dropToDestinations(targets);
};

Creep.prototype.dropEnergyToCollector = function () {
    this.memory.selectedSource = null;
    var collectors = cache.findEmptyCollectors(this.room);
    var collector = this.getNearestObjectByDistance(collectors);
    if (!collector)
        return;
    if (this.transfer(collector, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(collector, {visualizePathStyle: {stroke: '#0027ff'}});
    }
};

Creep.prototype.getNearestObjectByDistance = function (objects) {
    return this.pos.findClosestByRange(objects);
};

Creep.prototype.selectSource = function () {
    var sources = cache.findSources(this.room);
    var selectedSource = this.getNearestObjectByDistance(sources);
    if (selectedSource)
        this.memory.selectedSource = selectedSource.id;
};

Creep.prototype.goToSource = function () {
    var flag = Game.flags[this.memory.squad];
    if (flag != null) {
        this.memory.lastTick.roomName = this.roomName
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
    }
    //check if flag's room is visible
    if (flag && flag.room) {
        for (var i = 0; i < cache.findSources(flag.room).length; i++) {
            var source = cache.findSources(flag.room)[i];
            if (source.pos.x === flag.pos.x && source.pos.y === flag.pos.y) {
                this.memory.selectedSource = source.id;
            }
        }
    }
};

Creep.prototype.isAlive = function () {
    return !(!Game.creeps[this.name]);
};

Creep.prototype.harvestEnergy = function () {
    var source = Game.getObjectById(this.memory.selectedSource);
    var res = this.harvest(source);
    if (res == ERR_NOT_IN_RANGE) {
        this.moveTo(source, {visualizePathStyle: {stroke: '#0027ff'}});
    }

};

Creep.prototype.squadRally = function () {
    var flag = Game.flags[this.memory.squad];
    if (flag != null) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#001dff'}});
    }
};

Creep.prototype.attackEnemiesStatic = function () {
    var target = this.pos.findClosestByPath(this.room.find(FIND_HOSTILE_CREEPS));
    if (target) {
        var res = this.attack(target);
        // if (res === ERR_NOT_IN_RANGE) {
        //     this.moveTo(target, {visualizePathStyle: {stroke: '#ff000b'}});
        // }
    }
};

Creep.prototype.carrier = function () {
    var flag = Game.flags[this.memory.squad];
    if (flag != null) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
    }
};

Creep.prototype.collector = function () {
    var flag = Game.flags[this.memory.squad];
    if (flag != null) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
    }
};

Creep.prototype.feedEnergy = function (includeTowers) {
    this.memory.selectedSource = null;
    var structures = cache.findEnergyFedStructures(this.room, includeTowers);
    if (structures.length > 0) {
        var structure = this.getNearestObjectByDistance(structures);
        if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(structure, {visualizePathStyle: {stroke: '#ffe21f'}});
        }
    }
};

Creep.prototype.feedStructure = function (structure) {
    this.memory.selectedSource = null;
    if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(structure, {visualizePathStyle: {stroke: '#ffe21f'}});
    }
};

Creep.prototype.buildConstruction = function () {
    var flag = Game.flags[this.memory.squad];
    //move to flag if not in flag's room
    if (flag != null && (!flag.room || flag.room.name != this.room.name)) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
        return;
    }
    var constructionSites = cache.findConstructionSites(flag.room);
    if (constructionSites.length) {
        var construction = this.getNearestObjectByDistance(constructionSites);
        if (this.build(construction) == ERR_NOT_IN_RANGE) {
            this.moveTo(construction, {visualizePathStyle: {stroke: '#14ff00'}});
        }
    }
};

Creep.prototype.repairConstruction = function () {
    var repairConstructions = cache.findRepairStructures(this.room);
    if (repairConstructions.length) {
        var construction = this.getNearestObjectByDistance(repairConstructions);
        if (this.repair(construction) == ERR_NOT_IN_RANGE) {
            this.moveTo(construction, {visualizePathStyle: {stroke: '#14ff00'}});
        }
    }
};

Creep.prototype.repairWalls = function () {
    var repairWalls = cache.findRepairWalls(this.room);
    if (repairWalls.length) {
        if (this.repair(repairWalls[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(repairWalls[0], {visualizePathStyle: {stroke: '#14ff00'}});
        }
    }
};

Creep.prototype.upgradeController_ = function () {
    if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
    }
};

Creep.prototype.rest = function () {
    this.memory.selectedSource = null;
    this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
    this.say("Rest");
};

Creep.prototype.timeToDie = function () {
    var hasMovement = false;
    for (var i = 0; i < this.body.length; i++) {
        if (this.body[i].hits > 0 && this.body[i].type === 'move')
            hasMovement = true;
    }
    var disabled = !hasMovement && this.hits < this.hitsMax;
    if (disabled)
        console.log(this.name + " has been disabled");
    return (this.ticksToLive < 50);
};

Creep.prototype.suicide_ = function () {
    console.log(this.name + " a proud " + this.memory.role + " made the ultimate sacrifice taking " + this.carry.energy + " energy to the grave");
    this.suicide();
};

