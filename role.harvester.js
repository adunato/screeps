var StateMachine = require('state-machine');
var cache = require('cache');
var harvesterFSM = new StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: ['none','dropEnergy', 'rest', 'feedEnergy', 'selectSource', 'harvestEnergy'], to: 'selectSource'},
        {name: 'sourceSelected', from: ['selectSource', 'harvestEnergy'], to: 'harvestEnergy'},
        {name: 'energyFull', from: ['feedEnergy', 'harvestEnergy', 'rest','dropEnergy'], to: 'feedEnergy'},
        {name: 'energyFedStructuresFull', from: ['dropEnergy','feedEnergy', 'rest'], to: 'dropEnergy'},
        {name: 'noSource', from: ['harvestEnergy', 'rest'], to: 'rest'},
        {name: 'noEnergyContainers', from: ['dropEnergy','rest'], to: 'rest'},
        {name: 'timeToDie', from: ['*'], to: 'suicide'},
        {
            name: 'goto', from: '*', to: function (s) {
            return s
        }
        }
    ],
    data: function (creepName) {
        return {
            creepName: creepName
        }
    },
    methods: {
        onEnergyEmpty: function () {
            var creep = Game.creeps[this.creepName];
            creep.selectSource();
        },
        onEnergyFull: function () {
            var creep = Game.creeps[this.creepName];
            creep.feedEnergy();
        },
        onNoSource: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onNoEnergyContainers: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onEnergyFedStructuresFull: function () {
            var creep = Game.creeps[this.creepName];
            creep.dropEnergy();
        },
        onSourceSelected: function() {
            var creep = Game.creeps[this.creepName];
            creep.harvestEnergy();
        },
        onTimeToDie: function() {
            var creep = Game.creeps[this.creepName];
            creep.suicide();
        },
        onTransition(lifecycle) {
            // console.log("transition name: " + lifecycle.transition);
            // console.log("transition from: " + lifecycle.from);
            // console.log("transition to: " + lifecycle.to);
        }
    }
});


var roleHarvester = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "none";
        var stateMachine = new harvesterFSM(creep.name);
        stateMachine.goto(creepState);
        if (creep.carry.energy < creep.carryCapacity &&  !creep.memory.selectedSource && stateMachine.can("energyEmpty")) {
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy < creep.carryCapacity && creep.memory.selectedSource !== null && stateMachine.can("sourceSelected")) {
            stateMachine.sourceSelected();
        }
        if (creep.carry.energy === creep.carryCapacity && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        if (cache.findSources(creep.room).length === 0 && stateMachine.can("noSource")) {
            stateMachine.noSource();
        }
        if (cache.findEnergyContainers(creep.room).length === 0 && stateMachine.can("noEnergyContainers")) {
            stateMachine.noEnergyContainers();
        }
        if (cache.findEnergyFedStructures(creep.room).length === 0 && stateMachine.can("energyFedStructuresFull")) {
            stateMachine.energyFedStructuresFull();
        }
        if (creep.timeToDie() && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleHarvester;