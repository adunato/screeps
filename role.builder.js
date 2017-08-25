var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var room = creep.room;
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 withdraw');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if(creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                creep.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say("Rest");
            }
        }
        else {
            var containers = room.find(FIND_STRUCTURES, {
                filter: (container) => {
                    // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity;
                    return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy > 0;
                }

            });

            if(containers.length > 0) {
                if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                creep.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say("Rest");
            }
        }
    }
};

module.exports = roleBuilder;