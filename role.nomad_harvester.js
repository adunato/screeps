var nomad_harvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        creep.moveTo(Game.flags["Explore"], {visualizePathStyle: {stroke: '#ffffff'}});
    }
};

module.exports = nomad_harvester;