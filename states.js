var states = {

    initStates: function () {
        BUILD = 1;
        HARVEST = 2;
        WITHDRAW = 3;
        GO_TO_FLAG = 4;
        UPGRADE = 5;
        DROP_ENERGY = 6;
        WITHDRAW_ENERGY = 7;
        REST = 8;
        MOVE_TO_BUILD = 9;
        MOVE_TO_ENERGY_CONTAINER = 10;
    },
    build: function(creep){
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length) {
            if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.memory.state = MOVE_TO_BUILD;
            }
        } else {
            creep.memory.state = REST;
        }
    },
    moveToBuild: function(creep){
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
    },
    rest: function(creep){
        creep.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
        creep.say("Rest");
    },
    moveToEnergyContainer(creep) {
        var containers = room.find(FIND_STRUCTURES, {
            filter: (container) => {
                // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity;
                return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy > 0;
            }

        });

        if(containers.length > 0) {
            if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.state = MOVE_TO_ENERGY_CONTAINER;
            }
        } else {
            creep.state = REST;
        }
    },
    withdrawEnergy(creep) {
        var containers = room.find(FIND_STRUCTURES, {
            filter: (container) => {
                // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity;
                return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy > 0;
            }

        });

        if(containers.length > 0)
            creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        else {
            creep.state = REST;
        }
    }

}

module.exports = states;