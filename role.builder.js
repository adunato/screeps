var StateMachine = require('state-machine')
var builderFSM = new StateMachine({
    init: 'energyEmpty',
    transitions: [
        { name: 'energyEmpty', from: 'build',  to: 'withdraw' },
        { name: 'energyFull', from: 'withdraw', to: 'build'  },
        { name: 'containersEmpty', from: 'withdraw', to: 'rest'  },
    ],
    data: function(creep) {
        return {
            creep: creep
        }
    },
    methods: {
        onWithdraw:     function() {
            creep.withdrawEnergy();
        },
        onBuild:     function() {
            creep.build();
        }
    }
});

Memory.fsm = builderFSM;

Creep.prototype.withdrawEnergy = function() {
    var containers = room.find(FIND_STRUCTURES, {
        filter: (container) => {
            // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity;
            return (container.structureType == STRUCTURE_CONTAINER) && container.store.energy > 0;
        }

    });

    if(containers.length > 0) {
        if (this.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    } else {
        this.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
        this.say("Rest");
    }
};

Creep.prototype.build = function() {
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length) {
        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
    } else {
        creep.moveTo(Game.flags["RestArea"], {visualizePathStyle: {stroke: '#ffffff'}});
        creep.say("Rest");
    }
};


var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        //builderFSM.setState(creep.memory.state);
        if(creep.carry.energy == 0){
            console.log("i was here");
            builderFSM.energyEmpty();
        }
        console.log("i was here too");
        if(creep.carry.energy == creep.carryCapacity){
            builderFSM.energyFull();
        }
        creep.memory.state = builderFSM.state;
    }
};

module.exports = roleBuilder;