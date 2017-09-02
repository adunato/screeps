var nomad_harvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var MAX_NOMADS_PER_FLAG = 5;
        var FLAGS_NUM = 1;
        function getFlagRoomName(flagName){
            var flagRoom = Game.flags[flagName].room;
            //room is not visible
            if (typeof flagRoom == 'undefined') {
                return 'undefined';
            } else {
                return flagRoom.name;
            }
        }
        function countCreepsInFlagRoom(flagName){
            var ret =0;
            for(var i in Game.creeps){
                var creep = Game.creeps[i];
                if(creep.room.name == getFlagRoomName(flagName))
                    ret++;
            }
            return ret;
        }

        function selectHarvestRoom(flagName){
            var harvestRoom = Game.flags[flagName].room;
            //room is not visible
            if (typeof harvestRoom == 'undefined') {
                creep.moveTo(Game.flags[flagName], {visualizePathStyle: {stroke: '#ffaa00'}});
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
                creep.memory.selectedSource = selectedSource.id;
            }
        }

        var spawnRoom = Game.spawnsWithEnergy["Spawn1"].room;
        if (creep.carry.energy < creep.carryCapacity) {
            if(creep.memory.selectedSource == null) {
                for(var i = 1; i < FLAGS_NUM+1; i++) {
                    if(countCreepsInFlagRoom("harvest"+i) < MAX_NOMADS_PER_FLAG){
                        selectHarvestRoom("harvest"+i);
                    }
                }
            } else {
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