var StateMachine = require('state-machine');
var cache = require('cache');
var harvesterFSM = new StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: '*', to: 'harvestEnergy'},
        {name: 'energyFull', from: 'harvestEnergy', to: 'feedEnergy'},
        {name: 'energyFedStructuresFull', from: 'feedEnergy', to: 'dropEnergy'},
        {name: 'noSource', from: 'harvestEnergy', to: 'rest'},
        {name: 'noEnergyContainers', from: 'dropEnergy', to: 'rest'},
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
            creep.harvestEnergy();
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
        onTransition(lifecycle) {
            console.log("transition name: " + lifecycle.transition);
            console.log("transition from: " + lifecycle.from);
            console.log("transition to: " + lifecycle.to);
        }
    }
});


var roleBuilder = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        console.log("state: " + creepState);
        if (typeof creepState === "undefined")
            creepState = "none";
        var stateMachine = new harvesterFSM(creep.name);
        stateMachine.goto(creepState);
        if (creep.carry.energy < creep.carryCapacity && stateMachine.can("energyEmpty")) {
            console.log("energyEmpty");
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy === creep.carryCapacity && stateMachine.can("energyFull")) {
            console.log("energyFull");
            stateMachine.energyFull();
        }
        if (cache.findSources(creep.room).length === 0 && stateMachine.can("noSource")) {
            console.log("noSource");
            stateMachine.noSource();
        }
        if (cache.findEnergyContainers(creep.room).length === 0 && stateMachine.can("noEnergyContainers")) {
            console.log("noEnergyContainers");
            stateMachine.noEnergyContainers();
        }
        if (cache.findEnergyFedStructures(creep.room).length === 0 && stateMachine.can("energyFedStructuresFull")) {
            console.log("energyFedStructuresFull");
            stateMachine.energyFedStructuresFull();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleBuilder;