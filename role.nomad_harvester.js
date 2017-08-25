var nomad_harvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var spawnRoom = Game.spawns["Spawn1"].room;
        if (creep.carry.energy < creep.carryCapacity) {
            if(creep.memory.selectedSource == null) {
                var harvestRoom = Game.flags["harvest1"].room;
                //room is not visible
                if (typeof harvestRoom == 'undefined') {
                    creep.moveTo(Game.flags["harvest1"], {visualizePathStyle: {stroke: '#ffaa00'}});
                } else {
                    var sources = harvestRoom.find(FIND_SOURCES);
                    var selectedSource;
                    var maxEnergy = 0;
                    for (var i = 0; i < sources.length; i++) {
                        if (sources[i].energy > maxEnergy) {
                            selectedSource = sources[i];
                            maxEnergy = sources[i].energy;
                        }
                    }
                    if (creep.harvest(selectedSource) == ERR_NOT_IN_RANGE) {
                        creep.memory.selectedSource = selectedSource.id;
                    }
                }
            } else {
                console.log("moving to source");
                if (creep.harvest(Game.getObjectById(creep.memory.selectedSource)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.selectedSource), {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
        else {
            creep.memory.selectedSource = null;
            var targets = spawnRoom.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ) && structure.energy < structure.energyCapacity;
                }
            });
            var containers = spawnRoom.find(FIND_STRUCTURES, {
                filter: (container) => {
                    // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity;
                    return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy < container.storeCapacity;
                }

            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (containers.length > 0) {
                if (creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                creep.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say("Rest");
            }
        }
    }
};

module.exports = nomad_harvester;