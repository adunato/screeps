function SquadProfile(name) {
    //e.g. [["harvester",3], ["builder",1]]
    var squadAttributes = global.squadProfiles[name];
    this.squadRoles = squadAttributes.squadRoles;
    this.patrolling = squadAttributes.patrolling;
    this.name = name;
}
SquadProfile.prototype.getCreepQuantity = function(role) {
    for(var i = 0; i <  this.squadRoles.length; i++){
        //e.g. squadRole = [["harvester",3]
        var squadRole = this.squadRoles[i];
        if(squadRole[0] === role)
            return squadRole[1];
    }
    return 0;
};

SquadProfile.prototype.getName = function() {
    return this.name;
};

function SquadAttributes(squadRoles, patrolling){
    this.squadRoles = squadRoles;
    this.patrolling = patrolling;
}

module.exports = {SquadProfile, SquadAttributes};
