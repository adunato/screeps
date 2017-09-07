const DROP_CONTAINER = "DROP_CONTAINER";
const DROP_STRUCTURE = "DROP_STRUCTURE";
const DROP_COLLECTOR = "DROP_COLLECTOR";
const WAYPOINT_RANGE = 3;
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

Creep.prototype.withdrawEnergyFromSourceContainer = function (minQuantityPc) {
    var containers = cache.findSourceContainersWithEnergy(this.room,minQuantityPc);
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

Creep.prototype.dropToDestinations = function (destinations, sortByDistance) {
    if (destinations.length > 0) {
        var structure;
        if(sortByDistance)
            structure = this.getNearestObjectByDistance(destinations);
        else
            structure = destinations[0];
        if (!structure)
            return;
        if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(structure, {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.dropToStorage = function () {
    this.memory.selectedSource = null;
    var structures = cache.findEmptyStorage(this.room);
    return this.dropToDestinations(structures,true);
};

Creep.prototype.dropToDestinationContainer = function (maxQuantityPc) {
    this.memory.selectedSource = null;
    var structures = cache.findEmptyDestinationContainers(this.room,maxQuantityPc);
    return this.dropToDestinations(structures, false);
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
    return this.dropToDestinations(targets,true);
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
    if (this.roomName) {
        this.memory.lastTick.roomName = this.roomName
    }

    if(flag){
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
    } else{
        console.log("no flag with name: " + this.memory.squad);
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

Creep.prototype.isInSquadRoom = function () {
    var flag = Game.flags[this.memory.squad];
    if(!flag){
        console.log("could not find flag for squad: " + this.memory.squad);
        return false;
    }
    return flag.pos.roomName === this.pos.roomName;
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

Creep.prototype.setNextWaypoint = function () {
    //check existing waypoint
    if(!this.memory.current_waypoint){
        //if not set check if flag '1' exist and set it as WP
        if(this.waypointExist(1)){
            this.memory.current_waypoint = this.generateWaypointName(1);
        } else{
            console.log("creep " + this.name + " " + this.memory.role + " could not find waypoint " + this.generateWaypointName(1));
        }
    } else if (this.nextWaypoint()){
        this.memory.current_waypoint = this.nextWaypoint();
    } else if (this.previousWaypoint()){
        this.memory.current_waypoint = this.previousWaypoint();
    } else{
        console.log("creep " + this.name + " " + this.memory.role + " could not find next waypoint from" + this.memory.current_waypoint);
    }

}

Creep.prototype.previousWaypoint = function () {
    var currentWaypointNum = this.memory.current_waypoint.substr(this.memory.current_waypoint.length - 1)
    if(this.waypointExist(currentWaypointNum-1)){
        return this.generateWaypointName(currentWaypointNum-1);
    } else {
        return null;
    }
}


Creep.prototype.nextWaypoint = function () {
    var currentWaypointNum = this.memory.current_waypoint.substr(this.memory.current_waypoint.length - 1)
    if(this.waypointExist(currentWaypointNum+1)){
        return this.generateWaypointName(currentWaypointNum+1);
    } else {
        return null;
    }
}

Creep.prototype.waypointExist = function (waypointNumber) {
    let flag = Game.flags[this.memory.squad + '_' + waypointNumber];
    return !!flag;
}

Creep.prototype.generateWaypointName = function (waypointNumber) {
    return this.memory.squad+'_'+waypointNumber;
}

Creep.prototype.goToWaypoint = function () {
    var flag = Game.flags[this.memory.current_waypoint];
    if (flag != null) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
    } else {
        console.log("creep " + this.name + " " + this.memory.role + " could not find current waypoint: " + this.memory.current_waypoint);
    }
};

Creep.prototype.isInCurrentWaypointRange = function () {
    var flag = Game.flags[this.memory.current_waypoint];
    if (flag != null) {
        return
    } else {
        var flags = this.pos.findInRange(FIND_FLAGS, WAYPOINT_RANGE);
        for(var i = 0; i < flags.length; i++){
            if(flags[i] === flag ) {
                console.log("creep " + this.name + " " + this.memory.role + " in range of: " + this.memory.current_waypoint);
                return true;
            }
        }
        return false;
    }
};



Creep.prototype.attackEnemies = function (isStatic) {
    var target = this.pos.findClosestByPath(this.room.find(FIND_HOSTILE_CREEPS));
    if (target) {
        var res = this.attack(target);
        if (res === ERR_NOT_IN_RANGE && !isStatic) {
            this.moveTo(target, {visualizePathStyle: {stroke: '#ff000b'}});
        }
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

Creep.prototype.feedTower = function (minQuantityPc) {
    var tower = cache.findEmptyTowers(this.room, minQuantityPc)[0];
    if (tower && this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(tower, {visualizePathStyle: {stroke: '#ffe21f'}});
    }
};

Creep.prototype.buildConstruction = function () {
    var flag = Game.flags[this.memory.squad];
    //move to flag if not in flag's room
    if (flag != null && (!flag.room || flag.room.name != this.room.name)) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
        return;
    }
    if(flag && flag.room) {
        var constructionSites = cache.findConstructionSites(flag.room);
        if (constructionSites.length) {
            var construction = this.getNearestObjectByDistance(constructionSites);
            if (this.build(construction) == ERR_NOT_IN_RANGE) {
                this.moveTo(construction, {visualizePathStyle: {stroke: '#14ff00'}});
            }
        }
    }
};

Creep.prototype.repairConstruction = function () {
    var flag = Game.flags[this.memory.squad];
    //move to flag if not in flag's room
    if (flag != null && (!flag.room || flag.room.name != this.room.name)) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
        return;
    }
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

