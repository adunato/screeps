function Squad(squadProfile, squadName) {
    this.creeps = [];
    this.squadProfile = squadProfile;
    this.squadRoles = squadProfile.squadRoles;
    this.squadName = squadName;
    this.patrolling = squadProfile.patrolling;
}

Squad.prototype.addCreep = function (creep) {
    this.creeps.push(creep);
};

Squad.prototype.needCreep = function (creep) {
    var creepQuantity = this.getCreepQuantityWithRole(creep.memory.role);
    var profileQuantity = this.squadProfile.getCreepQuantity(creep.memory.role);
    return (creepQuantity < profileQuantity);
};

Squad.prototype.needCreepRole = function (creepRole) {
    var creepQuantity = this.getCreepQuantityWithRole(creepRole);
    var profileQuantity = this.squadProfile.getCreepQuantity(creepRole);
    return (creepQuantity < profileQuantity);
};


Squad.prototype.getCreepQuantityWithRole = function (creepRole) {
    var ret = 0;
    for (var i = 0; i < this.creeps.length; i++) {
        if (this.creeps[i].ticksToLive > 100) {
            ret++
        }
    }
    return ret;
    // var ret = 0;
    // for (var i = 0; i < this.creeps.length; i++) {
    //     var creep = this.creeps[i];
    //     if (creep.memory.role === creepRole)
    //         ret++;
    // }
    // return ret;
};

Squad.prototype.getName = function () {
    return this.squadName;
};

Squad.prototype.hasCreep = function (creep) {
    for (var i = 0; i < this.creeps.length; i++) {
        if (this.creeps[i].id === creep.id)
            return true;
    }
    return false;
};

module.exports = Squad;