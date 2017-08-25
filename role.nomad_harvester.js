var nomad_harvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        mainRoom = Game.spawns["Spawn1"].room;
        var rooms = Game.map.describeExits(mainRoom.name);
        Memory.neighbours = rooms;
        var room = rooms["1"];
        if(creep.carry.energy < creep.carryCapacity) {
            var sources = room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                creep.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say("Going to rest");
            }
        }
    }
};

module.exports = nomad_harvester;