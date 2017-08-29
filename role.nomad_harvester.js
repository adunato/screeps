function NomadHarvester(creep) {
    this.base = Creep;
    this.memory = creep.memory;
}

NomadHarvester.prototype = Object.create(Creep.prototype);
NomadHarvester.prototype.constructor = NomadHarvester;

NomadHarvester.prototype.harvestEnergy = function () {
    this.say("I'm nomad!")
    var source = Game.getObjectById(this.memory.selectedSource);
    if (this.harvest(source) == ERR_NOT_IN_RANGE) {
        this.moveTo(source, {visualizePathStyle: {stroke: '#0027ff'}});
    }
};
