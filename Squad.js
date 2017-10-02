function Squad(squadProfile, squadName, flagName) {
    this.creeps = [];
    this.squadProfile = squadProfile;
    this.squadRoles = squadProfile.squadRoles;
    this.squadName = squadName;
    this.patrolling = squadProfile.patrolling;
    this.flagName = flagName;
}

Squad.prototype.addCreep = function (creep) {
    this.creeps.push(creep);
};

Squad.prototype.getSquad = function(creep){
    for(var squadName in global.squadsIndex){
        if(squadsIndex[squadName].hasCreep(creep)) {
            return squadsIndex[squadName];
        }
    }
    return null;
}

Squad.prototype.needCreep = function (creep) {
    if (!this.squadFlagExist())
        return false;
    var creepQuantity = this.getCreepQuantityWithRole(creep.memory.role);
    var profileQuantity = this.squadProfile.getCreepQuantity(creep.memory.role);
    return (creepQuantity < profileQuantity) && this.squadProfile.spawnConditions(this.getFlagName());
};

//returns in order any assaulter or supporter
Squad.prototype.getAssaultSquadLeader = function () {
    for(var creepNum in this.creeps){
        var creepName = this.creeps[creepNum].name;
        var creep = Game.creeps[creepName];
        if(creep && creep.memory.role === "assaulter"){
            return creep;
        }
    }
    for(var creepNum in this.creeps){
        var creepName = this.creeps[creepNum].name;
        var creep = Game.creeps[creepName];
        if(creep && creep.memory.role === "supporter"){
            return creep;
        }
    }
    return null;
};


Squad.prototype.needCreepRole = function (creepRole) {
    if (!this.squadFlagExist())
        return false;
    var creepQuantity = this.getCreepQuantityWithRole(creepRole);
    var profileQuantity = this.squadProfile.getCreepQuantity(creepRole);
    return this.squadProfile.spawnConditions(this.getFlagName()) && (creepQuantity < profileQuantity);
};


Squad.prototype.getCreepQuantityWithRole = function (creepRole) {
    var ret = 0;
    if (!this.squadFlagExist())
        return ret;
    for (var i = 0; i < this.creeps.length; i++) {
        if ((!this.creeps[i].ticksToLive || this.creeps[i].ticksToLive > 100) && this.creeps[i].memory.role === creepRole) {
            ret++
        }
    }
    return ret;
};

Squad.prototype.getName = function () {
    return this.squadName;
};

Squad.prototype.getSpawn = function () {
    return this.getFlag().memory.spawn;
};

Squad.prototype.getSquadRoomName = function () {
    return Game.flags[this.flagName] ? Game.flags[this.flagName].pos.roomName : null;
};

Squad.prototype.getFlagName = function () {
    return this.flagName;
};

Squad.prototype.getFlag = function () {
    return Game.flags[this.flagName];
};

Squad.prototype.isPinnedToFlag = function () {
    var flag = Game.flags[this.flagName];
    if(flag && flag.memory){
        return flag.memory.pinnedToFlag;
    } else
        return false;
};


Squad.prototype.hasCreep = function (creep) {
    for (var i = 0; i < this.creeps.length; i++) {
        if (this.creeps[i].id === creep.id)
            return true;
    }
    return false;
};

Squad.prototype.squadFlagExist = function () {
    return !(!Game.flags[this.flagName]);
};


module.exports = Squad;