const WAYPOINT_RANGE = 1;
var cache = require('cache');
require('source_extension');
var Squad = require('Squad');
const DROP_CONTAINER = "DROP_CONTAINER";
const DROP_STRUCTURE = "DROP_STRUCTURE";
const DROP_COLLECTOR = "DROP_COLLECTOR";
const DROP_CARRIER = "DROP_CARRIER";
const DROP_STORAGE = "DROP_STORAGE";
const WITHDRAW_FROM_SPAWN = false;
const WAYPOINT_LOG = false;

Creep.prototype.withdrawEnergy = function (includeCarriers) {
    var energySources = cache.findObjectsWithEnergy(this.room,includeCarriers);
    if (WITHDRAW_FROM_SPAWN) {
        energySources = energySources.concat(cache.findSpawnsWithEnergy(this.room));
    }
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
        var energySource = this.containerWithMostEnergy(energySources);
        if(!energySource) {
            console.log("energySource null: " + energySources);
            return false;
        }
        var res = energySource.transfer(this, RESOURCE_ENERGY);
        if (res == ERR_NOT_IN_RANGE) {
            this.moveTo(energySource, {visualizePathStyle: {stroke: '#0027ff'}});
        }
        return true;
    }
};

Creep.prototype.containerWithMostEnergy = function (energySources) {
    var energy = 0;
    var selectedContainer = null;
    for(var key in energySources){
        if(energySources[key] instanceof StructureContainer) {
            if (energySources[key].store[RESOURCE_ENERGY] > energy) {
                energy = energySources[key].store[RESOURCE_ENERGY];
                selectedContainer = energySources[key];
            }
        } else if(energySources[key] instanceof StructureLink){
            if (energySources[key].energy > energy) {
                energy = energySources[key].energy;
                selectedContainer = energySources[key];
            }
        } else if(energySources[key] instanceof Creep){
            if (_.sum(energySources[key].carry) > energy) {
                energy = _.sum(energySources[key].carry);
                selectedContainer = energySources[key];
            }
        }
    }
    return selectedContainer;
};

Creep.prototype.withdrawEnergyExCarriers = function () {
    var containers = cache.findContainersWithEnergy(this.room);
    return this.withdrawEnergyFromSources(containers);
};

Creep.prototype.withdrawEnergyFromSourceContainer = function (minQuantityPc) {
    var containers = cache.findSourceContainersWithEnergy(this.getSquad().getSquadRoomName(), minQuantityPc);
    containers = containers.concat(cache.findSourceLinksWithEnergy(this.getSquad().getSquadRoomName(), minQuantityPc));
    return this.withdrawEnergyFromSources(containers);
};

Creep.prototype.withdrawEnergyFromCarrier = function () {
    var carriers = cache.findCarriersWithEnergy(this.room);
    return this.withdrawEnergyFromSources(carriers);
};

Creep.prototype.withdrawEnergyFromSpawn = function () {
    var spawns = cache.findSpawnsWithEnergy(this.room);
    if (spawns.length > 0) {
        if (this.withdraw(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(spawns[0], {visualizePathStyle: {stroke: '#0027ff'}});
        }
    }
};

Creep.prototype.dropToDestinations = function (destinations, sortByDistance) {
    if (destinations.length > 0) {
        var structure;
        if (sortByDistance)
            structure = this.getNearestObjectByDistance(destinations);
        else
            structure = destinations[0];
        if (!structure)
            return false;
        if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(structure, {visualizePathStyle: {stroke: '#0027ff'}});
        }
        return true;
    }
};

Creep.prototype.dropToStorage = function () {
    this.memory.selectedSource = null;
    var structures = cache.findEmptyStorage(this.room);
    return this.dropToDestinations(structures, true);
};

Creep.prototype.dropToDestinationContainer = function (maxQuantityPc) {
    this.memory.selectedSource = null;
    if (!this.getSquad())
        return false;
    var structures = cache.findEmptyDestinationContainers(this.getSquad().getSquadRoomName(), maxQuantityPc);
    structures = structures.concat(cache.findEmptyDestinationLinks(this.getSquad().getSquadRoomName(), maxQuantityPc));
    return this.dropToDestinations(structures, false);
};

Creep.prototype.dropEnergy = function (options) {
    this.memory.selectedSource = null;
    var targets = [];
    if (options[DROP_CONTAINER]) {
        var containers = cache.findEnergyContainers(this.room);
        targets = targets.concat(containers);
    }
    if (options[DROP_COLLECTOR]) {
        var collectors = cache.findEmptyCollectors(this.room)
        targets = targets.concat(collectors);
    }
    if (options[DROP_STRUCTURE]) {
        var energyStructures = cache.findEnergyFedStructures(this.room, false);
        targets = targets.concat(energyStructures);
    }
    if (options[DROP_CARRIER]) {
        var carriers = cache.findEmptyCarriers(this.room);
        targets = targets.concat(carriers);
    }
    return this.dropToDestinations(targets, true);
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

    if (flag) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
        // console.log("moving to source on flag: " + flag.name);
    } else {
        // console.log("no flag with name: " + this.memory.squad);
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

Creep.prototype.goToClaim = function () {
    var flag = Game.flags[this.memory.squad];
    if (this.roomName) {
        this.memory.lastTick.roomName = this.roomName
    }

    if (flag) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#001dff'}});
        // console.log("moving to source on flag: " + flag.name);
    } else {
        // console.log("no flag with name: " + this.memory.squad);
    }
    //check if flag's room is visible
    if (this.isInSquadRoom() && flag && flag.room) {
        if (this.claimController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
};

Creep.prototype.goToReserve = function () {
    var flag = Game.flags[this.memory.squad];
    if (this.roomName) {
        this.memory.lastTick.roomName = this.roomName
    }

    if (flag) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#001dff'}});
        // console.log("moving to source on flag: " + flag.name);
    } else {
        // console.log("no flag with name: " + this.memory.squad);
    }
    //check if flag's room is visible
    if (this.isInSquadRoom() && flag && flag.room) {
        if (this.reserveController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
};

Creep.prototype.getSquad = function () {
    return Squad.prototype.getSquad(this);
}

Creep.prototype.isInSquadRoom = function () {
    var flag = Game.flags[this.memory.squad];
    if (!flag) {
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
    if (!this.memory.current_waypoint) {
        //if not set check if flag '1' exist and set it as WP and fwd as default direction
        if (this.waypointExist(1)) {
            console.log(this.memory.role + " setting default waypoint as " + this.generateWaypointName(1))
            this.memory.current_waypoint = this.generateWaypointName(1);
            this.memory.waypoint_fwd_direction = true;
        } else {
            console.log("creep " + this.name + " " + this.memory.role + " could not find waypoint " + this.generateWaypointName(1));
        }
        return;
    }
    //fwd WP check
    if (this.memory.waypoint_fwd_direction === true) {
        if (this.nextWaypoint()) {
            if (WAYPOINT_LOG)
                console.log(this.name + ' ' + this.memory.role + " setting " + this.nextWaypoint() + " as next waypoint")
            this.memory.current_waypoint = this.nextWaypoint();
        } else {
            this.memory.waypoint_fwd_direction = false;
            if (this.previousWaypoint()) {
                if (WAYPOINT_LOG)
                    console.log(this.memory.role + " setting " + this.previousWaypoint() + " as next waypoint")
                this.memory.current_waypoint = this.previousWaypoint();
            } else {
                if (WAYPOINT_LOG)
                    console.log("No backward or forward waypoints from " + this.memory.current_waypoint + " for creep " + this.name + " " + this.memory.role)
            }
        }
    } else {
        //bkwd WP check
        if (this.previousWaypoint()) {
            if (WAYPOINT_LOG)
                console.log(this.name + ' ' + this.memory.role + " setting " + this.previousWaypoint() + " as next waypoint")
            this.memory.current_waypoint = this.previousWaypoint();
        } else {
            this.memory.waypoint_fwd_direction = true;
            if (this.nextWaypoint()) {
                if (WAYPOINT_LOG)
                    console.log(this.memory.role + " setting " + this.nextWaypoint() + " as next waypoint")
                this.memory.current_waypoint = this.nextWaypoint();
            } else {
                if (WAYPOINT_LOG)
                    console.log("No backward or forward waypoints from " + this.memory.current_waypoint + " for creep " + this.name + " " + this.memory.role)
            }
        }
    }
}

Creep.prototype.previousWaypoint = function () {
    var currentWaypointNum = Number(this.memory.current_waypoint.substr(this.memory.current_waypoint.length - 1))
    if (this.waypointExist(currentWaypointNum - 1)) {
        return this.generateWaypointName(currentWaypointNum - 1);
    } else {
        return null;
    }
}


Creep.prototype.nextWaypoint = function () {
    var currentWaypointNum = Number(this.memory.current_waypoint.substr(this.memory.current_waypoint.length - 1))
    if (this.waypointExist(currentWaypointNum + 1)) {
        return this.generateWaypointName(currentWaypointNum + 1);
    } else {
        return null;
    }
}

Creep.prototype.waypointExist = function (waypointNumber) {
    let flag = Game.flags[this.memory.squad + '_' + waypointNumber];
    return !!flag;
}

Creep.prototype.generateWaypointName = function (waypointNumber) {
    return this.memory.squad + '_' + waypointNumber;
}

Creep.prototype.goToWaypoint = function () {
    var flag = Game.flags[this.memory.current_waypoint];
    if (flag != null) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
    } else {
        console.log("creep " + this.name + " " + this.memory.role + " could not find current waypoint: " + this.memory.current_waypoint + ". Invoking setNextWaypoint()");
        this.setNextWaypoint();
    }
};

Creep.prototype.getCurrentWaypoint = function () {
    return this.memory.current_waypoint;
}


Creep.prototype.isInCurrentWaypointRange = function () {
    var flag = Game.flags[this.memory.current_waypoint];
    if (!flag) {
        return
    } else {
        var flags = this.pos.findInRange(FIND_FLAGS, WAYPOINT_RANGE);
        for (var i = 0; i < flags.length; i++) {
            if (flags[i] === flag) {
                if (WAYPOINT_LOG)
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

Creep.prototype.rangeAttackEnemies = function (isStatic) {
    var target = this.pos.findClosestByPath(this.room.find(FIND_HOSTILE_CREEPS));
    if (target) {
        var res = this.rangedAttack(target);
        if (res === ERR_NOT_IN_RANGE && !isStatic) {
            this.moveTo(target, {visualizePathStyle: {stroke: '#ff000b'}});
        }
    }
};

Creep.prototype.attackFlagPosition = function () {
    if (!this.getSquad())
        return;
    var flag = this.getSquad().getFlag();
    if (flag) {
        var target = null;
        var look = this.room.lookForAt(LOOK_STRUCTURES,flag.pos);
        if(look.length > 0)
            target = look[0];
        if(target) {
            var res = this.attack(target);
            if (res === ERR_NOT_IN_RANGE) {
                this.moveTo(flag, {visualizePathStyle: {stroke: '#ff000b'}});
            }
        }

    }
};

Creep.prototype.moveToFlag = function () {
    if (!this.getSquad())
        return;
    var flag = this.getSquad().getFlag();
    if (flag)
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ff000b'}});
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
        return true;
    }
    if (flag && flag.room) {
        var constructionSites = cache.findConstructionSites(flag.room);
        if (constructionSites.length) {
            var construction = this.getNearestObjectByDistance(constructionSites);
            if (this.build(construction) == ERR_NOT_IN_RANGE) {
                this.moveTo(construction, {visualizePathStyle: {stroke: '#14ff00'}});
            }
            return true;
        } else
            return false;
    }
    return false;
};

Creep.prototype.repairConstruction = function (minRepairLevelPc) {
    var flag = Game.flags[this.memory.squad];
    //move to flag if not in flag's room
    if (flag != null && (!flag.room || flag.room.name != this.room.name)) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
        return true;
    }
    if (flag && flag.room) {
        var construction = null;
        if (this.memory.repairConstructionId) {
            construction = Game.getObjectById(this.memory.repairConstructionId);
        }
        if (!construction) {
            var repairConstructions = cache.findRepairStructures(flag.room, minRepairLevelPc);
            if (repairConstructions.length) {
                construction = this.getNearestObjectByDistance(repairConstructions);
            }
        }
        if (construction) {
            this.memory.repairConstructionId = construction.id;
            if (this.repair(construction) === ERR_NOT_IN_RANGE) {
                this.moveTo(construction, {visualizePathStyle: {stroke: '#14ff00'}});
            } else if (construction.hits === construction.hitsMax) {
                this.memory.repairConstructionId = null;
            }
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

Creep.prototype.multiFunction = function () {
    if (this.room.controller.ticksToDowngrade < 1000 || this.room.controller.level === 1) {
        this.upgradeController_()
        return;
    }
    else {
        if (this.dropEnergy({DROP_CONTAINER: true}))
            return;

        var repairs = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax;
            }
        });
        console.log(repairs.length);
        if (repairs.length > 0) {
            this.repairConstruction(100);
            return;
        }
        var spawns = cache.findSpawnsWithEnergy(this.room);
        if (spawns.length > 0) {
            var spawn = spawns[0];
            if (spawn.energy < spawn.energyCapacity) {
                this.dropEnergy({DROP_STRUCTURE: true});
                return;
            }
        }
        var extensions = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
            }
        });
        if (extensions.length > 0) {
            this.dropEnergy({DROP_STRUCTURE: true});
            return;
        }
        if (!this.buildConstruction()) {
            this.upgradeController_()
        }
    }
};

Creep.prototype.upgradeController_ = function () {
    var flag = Game.flags[this.memory.squad];
    //move to flag if not in flag's room
    if (flag != null && (!flag.room || flag.room.name != this.room.name)) {
        this.moveTo(flag, {visualizePathStyle: {stroke: '#ffda00'}});
        return;
    }
    if (flag && flag.room) {
        if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
};

Creep.prototype.rest = function () {
    this.memory.selectedSource = null;
    //var pinnedToRoom = false;
    if (this.getSquad()) {
        //pinnedToRoom = this.getSquad().isPinnedToFlag();
        this.moveTo(this.getSquad().getFlag(), {visualizePathStyle: {stroke: '#ffffff'}});
        this.say("Rest");
    }
    // if(Game.flags["RestArea"].pos.roomName === this.pos.roomName || !pinnedToRoom) {
    //     this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
    //     this.say("Go Rest");
    // } else {
    //     this.moveTo(Game.flags[this.memory.squad], {visualizePathStyle: {stroke: '#ffffff'}});
    //     this.say("Stay");
    // }
};

Creep.prototype.goHome = function () {
    var room = Game.rooms[this.memory.spawnRoom];
    var spawn = room.find(FIND_MY_SPAWNS)[0];
    this.moveTo(spawn, {visualizePathStyle: {stroke: '#ffffff'}});
    this.say("Going Home");
};

Creep.prototype.followAssaultSquadLeader = function () {
    if(this.getSquad()) {
        var squadLeader = this.getSquad().getAssaultSquadLeader();
        if(squadLeader) {
            this.moveTo(squadLeader, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 0});
        }
    }
};

Creep.prototype.getAssaultSquadLeader = function () {
    if(this.getSquad()) {
        return this.getSquad().getAssaultSquadLeader();
    }
};

Creep.prototype.healTeamMates = function () {
    if(this.getSquad()) {
        var injuredCreeps = this.findInjuredTeamMates();
        var creep = this.getNearestObjectByDistance(injuredCreeps);
        if(creep) {
            //swaps with game object
            creep = Game.creeps[creep.name];
            if (this.heal(creep) == ERR_NOT_IN_RANGE) {
                this.moveTo(creep, {visualizePathStyle: {stroke: '#14ff00'}});
                if (this.rangedHeal(creep) == ERR_NOT_IN_RANGE) {
                    this.moveTo(creep, {visualizePathStyle: {stroke: '#14ff00'}});
                }
            }
        }
    }
};

Creep.prototype.findInjuredTeamMates = function () {
    var injuredCreps = [];
    if(this.getSquad()) {
        var creeps = this.getSquad().creeps;
        for(var i =0 ; i < creeps.length; i++){
            var creep = creeps[i];
            creep = Game.creeps[creep.name];
            if(creep.hits < creep.hitsMax) {
                injuredCreps.push(creep);
            }
        }
    }
    return injuredCreps;
};



Creep.prototype.timeToDie = function () {
    var hasMovement = false;
    for (var i = 0; i < this.body.length; i++) {
        if (this.body[i].hits > 0 && this.body[i].type === 'move')
            hasMovement = true;
    }
    var disabled = !hasMovement && this.hits < this.hitsMax;
    if (disabled)
        console.log(this.name + " has been disabled in room " + this.room.name);
    return (this.ticksToLive < 50);
};

Creep.prototype.suicide_ = function () {
    console.log(this.name + " a proud " + this.memory.role + " made the ultimate sacrifice taking " + this.carry.energy + " energy to the grave");
    this.suicide();
};

