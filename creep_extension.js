var cache = require('cache');
require('source_extension');
Creep.prototype.withdrawEnergy = function () {
    var containers = cache.findContainersWithEnergy(this.room);
    if (containers.length > 0) {
        if (this.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(containers[0], {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.withdrawEnergyFromSpawn = function () {
    var spawns = cache.findSpawnWithEnergy(this.room);
    if (spawns.length > 0) {
        if (this.withdraw(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(spawns[0], {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.withdrawEnergyFromCarrier = function () {
    var carriers = cache.findCarriersWithEnergy(this.room);
    if (carriers.length > 0) {
        if (carriers[0].transfer(this, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(carriers[0], {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.dropEnergyToCollector = function () {
    var collectors = cache.findEmptyCollectors(this.room);
    if (collectors.length > 0) {
        if (this.transfer(collectors[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(collectors[0], {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.selectSource = function () {
    if (this.memory.role === "nomad_harvester")
        return this.nomad_harvester_selectSource();
    var sources = cache.findSources(this.room);
    var selectedSource = null;
    var minDistance = 1000;
    for (var i = 0; i < sources.length; i++) {
        var distance = this.room.findPath(this.pos,sources[i].pos).length;
        if (distance < minDistance) {
            if(sources[i].getAvailableWithdrawingSlots() > 0) {
                selectedSource = sources[i];
                minDistance = distance;
            }
        }
    }
    if(selectedSource)
        this.memory.selectedSource = selectedSource.id;
};


Creep.prototype.nomad_harvester_selectSource = function () {
    var sources = cache.findSources(this.room);
    var selectedSource;
    var maxEnergy = 0;
    for (var i = 0; i < sources.length; i++) {
        if (sources[i].energy > maxEnergy) {
            selectedSource = sources[i];
            maxEnergy = sources[i].energy;
        }
    }
    this.memory.selectedSource = selectedSource.id;
};

Creep.prototype.isAlive = function () {
    return !(!Game.creeps[this.name]);
};

Creep.prototype.harvestEnergy = function () {
    var source = Game.getObjectById(this.memory.selectedSource);
    if (this.harvest(source) == ERR_NOT_IN_RANGE) {
        this.moveTo(source, {visualizePathStyle: {stroke: '#0027ff'}});
    }
};

Creep.prototype.dropEnergy = function () {
    this.memory.selectedSource = null;
    var structures = cache.findEnergyContainers(this.room);
    if (structures.length > 0) {
        if (this.transfer(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(structures[0], {visualizePathStyle: {stroke: '#ffda00'}});
        }
    }
};

Creep.prototype.carrier = function () {
    var flag = Game.flags[this.memory.squad];
    if(flag != null){
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
    }
};

Creep.prototype.collector = function () {
    var flag = Game.flags[this.memory.squad];
    if(flag != null){
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
    }
};

Creep.prototype.feedEnergy = function () {
    this.memory.selectedSource = null;
    var structures = cache.findEnergyFedStructures(this.room);
    if (structures.length > 0) {
        if (this.transfer(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(structures[0], {visualizePathStyle: {stroke: '#ffe21f'}});
        }
    }
};

Creep.prototype.buildConstruction = function () {
    var constructionSites = cache.findConstructionSites(this.room);
    if (constructionSites.length) {
        if (this.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(constructionSites[0], {visualizePathStyle: {stroke: '#14ff00'}});
        }
    }
};

Creep.prototype.repairConstruction = function () {
    var repairConstructions = cache.findRepairStructures(this.room);
    if (repairConstructions.length) {
        if (this.repair(repairConstructions[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(repairConstructions[0], {visualizePathStyle: {stroke: '#14ff00'}});
        }
    }
};

Creep.prototype.upgradeController_ = function () {
    if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
    }
};

Creep.prototype.rest = function () {
    this.memory.selectedSource = null;
    this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
    this.say("Rest");
};

Creep.prototype.timeToDie = function () {
    for (var i = 0; i < this.body.length; i++) {
        if (this.body[i].hits < 100)
            return true;
    }
    return false;
};
