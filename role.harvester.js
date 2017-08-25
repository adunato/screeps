var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var room = creep.room;
        if (creep.carry.energy < creep.carryCapacity) {
            var sources = room.find(FIND_SOURCES);
            var selectedSource;
            var maxEnergy = 0;
            for(var i = 0; i < sources.length; i++) {
                if(sources[i].energy > maxEnergy){
                    selectedSource = sources[i];
                    maxEnergy = sources[i].energy;
                }
            }
            if (creep.harvest(selectedSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(selectedSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ) && structure.energy < structure.energyCapacity;
                }
            });
            var containers = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity;
                    return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy < container.storeCapacity;
                }

            });
            Memory.containers = containers;
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (containers.length > 0){
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

module.exports = roleHarvester;