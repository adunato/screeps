function Squad(squadProfile) {
    this.creeps = {};
    this.squadProfile = squadProfile;
};

Squad.prototype.addCreep = function (creep) {
    creeps.add(creep);
};

Squad.prototype.needCreep = function (creep) {
    var creepQuantity = this.getCreepQuantityWithRole(creep.memory.role);
    var profileQuantity = this.squadProfile.getCreepQuantity(creepRole);
    return (creepQuantity < profileQuantity);
};

Squad.prototype.getCreepQuantityWithRole = function (creepRole) {
    var ret = 0;
    for(creep in creeps){
        if(creep.memory.role === creepRole)
            ret++;
    }
    return ret;
}

Squad.prototype.getName = function () {
    return this.squadProfile.getName();
}


module.exports = Squad;