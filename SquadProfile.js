function SquadProfile(name) {
    this.squadProfile = global.squadProfiles[name];
    this.name = name;
};

SquadProfile.prototype.getCreepQuantity = function(role) {
    for(role in this.squadProfile){
        if(role[0] === role)
            return role[1];
    }
    return 0;
};

SquadProfile.prototype.getName = function() {
    return this.name;
};

module.exports = SquadProfile;
