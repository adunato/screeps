var statemachine = require('state-machine');
var cache = require('cache');
var collectorFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: ['none', 'rest', 'collectEnergy'], to: 'collectEnergy'},
        {name: 'energyFull', from: ['feedEnergy', 'collectEnergy', 'rest','dropEnergy'], to: 'feedEnergy'},
        {name: 'reDropEnergy', from: ['feedEnergy','reDropEnergy'], to: 'feedEnergy'},
        {name: 'energyFedStructuresFull', from: ['dropEnergy','feedEnergy', 'rest'], to: 'dropEnergy'},
        {name: 'noSource', from: ['collectEnergy', 'rest'], to: 'rest'},
        {name: 'noEnergyContainers', from: ['dropEnergy','rest'], to: 'rest'},
        {name: 'timeToDie', from: ['*'], to: 'suicide'},
        {name: 'timeToDie', from: ['collectEnergy', 'suicide'], to: 'suicide'},
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
            creep.collector();
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
        onTimeToDie: function() {
            var creep = Game.creeps[this.creepName];
            creep.suicide_();
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
        var stateMachine = new collectorFSM(creep.name);
        stateMachine.goto(creepState);
        if (creep.carry.energy < creep.carryCapacity && stateMachine.can("energyEmpty")) {
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy === creep.carryCapacity && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        if (creep.carry.energy > 0 && stateMachine.can("reDropEnergy")) {
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
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleHarvester;