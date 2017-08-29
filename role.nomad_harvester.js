function NomadHarvester(creep) {
    this.base = Creep;
    this.base(creep);
}

NomadHarvester.prototype = Object.create(Creep.prototype);
NomadHarvester.prototype.constructor = NomadHarvester;
