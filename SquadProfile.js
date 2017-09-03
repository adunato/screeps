function SquadProfile(name) {
    //e.g. [["harvester",3], ["builder",1]]
    this.squadProfile = global.squadProfiles[name];
    this.name = name;
}
SquadProfile.prototype.getCreepQuantity = function(role) {
    for(var i = 0; i <  this.squadProfile.length; i++){
        //e.g. squadRole = [["harvester",3]
        var squadRole = this.squadProfile[i];
        if(squadRole[0] === role)
            return squadRole[1];
    }
    return 0;
};

SquadProfile.prototype.getName = function() {
    return this.name;
};

module.exports = SquadProfile;
