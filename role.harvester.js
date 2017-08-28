var StateMachine = require('state-machine');
var cache = require('cache');
var harvesterFSM = new StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: '*', to: 'harvestEnergy'},
        {name: 'energyFull', from: '*', to: 'dropEnergy'},
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
            creep.dropEnergy();
        },
        onNoSource: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onNoEnergyContainers: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onTransition(lifecycle) {
            // console.log("transition name: " + lifecycle.transition);
            // console.log("transition from: " + lifecycle.from);
            // console.log("transition to: " + lifecycle.to);
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
        if (creep.carry.energy < creep.carryCapacity) {
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy === creep.carryCapacity) {
            stateMachine.energyFull();
        }
        if (cache.findSources(creep.room).length === 0 && stateMachine.can("noSource")) {
            stateMachine.noSource();
        }
        if (cache.findEnergyContainers(creep.room).length === 0 && stateMachine.can("noEnergyContainers")) {
            stateMachine.noEnergyContainers();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleBuilder;