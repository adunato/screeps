function Squad(squadProfile, squadName) {
    this.creeps = new Array();
    this.squadProfile = squadProfile;
    this.squadName = squadName;
};

Squad.prototype.addCreep = function (creep) {
    this.creeps.push(creep);
};

Squad.prototype.needCreep = function (creep) {
    var creepQuantity = this.getCreepQuantityWithRole(creep.memory.role);
    console.log("creepQuantity " + creepQuantity);
    var profileQuantity = this.squadProfile.getCreepQuantity(creep.memory.role);
    console.log("profileQuantity " + profileQuantity);
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

Squad.prototype.hasCreep = function (creep) {
    for(var i = 0; i < this.creeps.length; i++){
        if(this.creeps[i].id === creep.id)
            return true;
    }
    return false;
}

module.exports = Squad;