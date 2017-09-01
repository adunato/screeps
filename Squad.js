function Squad(squadProfile, squadName) {
    this.creeps = {};
    this.squadProfile = squadProfile;
    this.squadName = squadName;
};

Squad.prototype.addCreep = function (creep) {
    this.creeps.add(creep);
};

Squad.prototype.needCreep = function (creep) {
    var creepQuantity = this.getCreepQuantityWithRole(creep.memory.role);
    var profileQuantity = this.squadProfile.getCreepQuantity(creep.memory.role);
    return (creepQuantity < profileQuantity);
};

Squad.prototype.getCreepQuantityWithRole = function (creepRole) {
    var ret = 0;
    for(var i = 0; i < this.creeps.length; i++){
        var creep = this.creeps[i];
        if(creep.memory.role === creepRole)
            ret++;
    }
    return ret;
}

Squad.prototype.getName = function () {
    return this.squadName;
}


module.exports = Squad;