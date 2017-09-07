function SquadProfile(name) {
    //e.g. [["harvester",3], ["builder",1]]
    this.squadProfile = global.squadProfiles[name];
    if(!this.squadProfile){
        console.log("error: " + name);
    }
    this.name = name;
}
SquadProfile.prototype.getCreepQuantity = function(role) {
    if(!this.squadProfile){
        console.log("error: " + this.name);
    }
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
