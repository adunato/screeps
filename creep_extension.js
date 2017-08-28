var cache = require('cache');
Creep.prototype.withdrawEnergy = function () {
    var containers = cache.findContainers(this.room);

    if (containers.length > 0) {
        if (this.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    } else {
        this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
        this.say("Rest");
    }
};

Creep.prototype.buildConstruction = function () {
    var targets = this.room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
        if (this.build(targets[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
    } else {
        this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
        this.say("Rest");
    }
};

Creep.prototype.rest = function () {
    this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
    this.say("Rest");
};