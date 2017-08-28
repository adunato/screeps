var cache = require('cache');
Creep.prototype.withdrawEnergy = function () {
    var containers = cache.findContainers(this.room);
    if (containers.length > 0) {
        if (this.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
};

Creep.prototype.harvestEnergy = function () {
    var sources = cache.findSources(this.room);
    if (sources.length > 0) {
        if (this.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
};

Creep.prototype.dropEnergy = function () {
    var structures = cache.findEnergyContainers(this.room);
    if (structures.length > 0) {
        if (this.transfer(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(structures[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
};

Creep.prototype.feedEnergy = function () {
    var structures = cache.findEnergyFedStructures(this.room);
    if (structures.length > 0) {
        if (this.transfer(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(structures[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
};

Creep.prototype.buildConstruction = function () {
    var constructionSites = cache.findConstructionSites(this.room);
    if (constructionSites.length) {
        if (this.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(constructionSites[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
};

Creep.prototype.rest = function () {
    this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
    this.say("Rest");
};