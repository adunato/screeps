var statemachine = require('state-machine');
// var visualize = require('visualize');
var cache = require('cache');
var harvesterFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        //all "end-states" lead back to start
        {name: 'energyEmpty', from: ['none','dropEnergy', 'rest', 'feedEnergy', 'selectSource', 'dropCollector'], to: 'selectSource'},
        //only selectSource is gateway to harvestEnergy provided that all drop-states lead to source = null
        {name: 'sourceSelected', from: ['selectSource', 'harvestEnergy'], to: 'harvestEnergy'},
        // all drop-states are linked to account for filling up conditions + rest
        {name: 'energyFull', from: ['feedEnergy', 'harvestEnergy', 'rest','dropEnergy', 'dropCollector'], to: 'dropCollector'},
        {name: 'collectorFull', from: ['feedEnergy', 'harvestEnergy', 'rest','dropEnergy', 'dropCollector'], to: 'feedEnergy'},
        {name: 'energyFedStructuresFull', from: ['feedEnergy', 'harvestEnergy', 'rest','dropEnergy', 'dropCollector'], to: 'dropEnergy'},
        //rest is connected only to last drop-state in 'no place where to drop' scenario
        {name: 'noEnergyContainers', from: ['dropEnergy','rest'], to: 'rest'},
        //noSource condition: at start and while harvesting
        {name: 'noSource', from: ['selectSource','harvestEnergy', 'rest'], to: 'rest'},
        // {name: 'timeToDie', from: ['*'], to: 'suicide'},
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
            creep.dropEnergyToCollector();
        },
        onCollectorFull: function () {
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
        console.log(statemachine.visualize(stateMachine));
        stateMachine.goto(creepState);
        if (creep.carry.energy < creep.carryCapacity &&  !creep.memory.selectedSource && stateMachine.can("energyEmpty")) {
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy < creep.carryCapacity && creep.memory.selectedSource && stateMachine.can("sourceSelected")) {
            stateMachine.sourceSelected();
        }
        if (creep.carry.energy === creep.carryCapacity && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        if (cache.findEmptyCollectors(creep.room).length === 0 && stateMachine.can("collectorFull")) {
            stateMachine.collectorFull();
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