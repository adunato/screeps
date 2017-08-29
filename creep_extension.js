var cache = require('cache');
Creep.prototype.withdrawEnergy = function () {
    var containers = cache.findContainers(this.room);
    if (containers.length > 0) {
        if (this.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(containers[0], {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.selectSource = function () {
    var sources = cache.findSources(this.room);
    var selectedSource;
    var maxEnergy = 0;
    for(var i = 0; i < sources.length; i++) {
        if(sources[i].energy > maxEnergy){
            selectedSource = sources[i];
            maxEnergy = sources[i].energy;
        }
    }
    this.memory.selectedSource = selectedSource.id;
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

Creep.prototype.rest = function () {
    this.memory.selectedSource = null;
    this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
    this.say("Rest");
};