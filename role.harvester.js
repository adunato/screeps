var statemachine = require('state-machine');
var cache = require('cache');
const MULTI_FUNCTION = false;
var harvesterFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        //all "end-states" lead back to start
        {name: 'energyEmpty', from: ['none','dropEnergy', 'rest', 'goToSource'], to: 'goToSource'},
        //only goToSource is gateway to harvestEnergy provided that all drop-states lead to source = null
        {name: 'sourceSelected', from: ['goToSource', 'harvestEnergy'], to: 'harvestEnergy'},
        // all drop-states are linked to account for filling up conditions + rest
        {name: 'energyFull', from: ['harvestEnergy','rest','dropEnergy',], to: 'dropEnergy'},
        {name: 'noEnergyContainers', from: ['dropEnergy','rest'], to: 'rest'},
        //noSource condition: at start and while harvesting
        // {name: 'noSource', from: ['goToSource','harvestEnergy', 'rest'], to: 'rest'},
        {name: 'timeToDie', from: ['dropEnergy','suicide'], to: 'suicide'},
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
        onGoToSource: function () {
            var creep = Game.creeps[this.creepName];
            creep.goToSource();
        },
        onDropEnergy: function () {
            var creep = Game.creeps[this.creepName];
            creep.memory.selectedSource = null;
            if(!MULTI_FUNCTION) {
                creep.dropEnergy({DROP_CONTAINER : true,DROP_STRUCTURE : true, DROP_COLLECTOR: true, DROP_CARRIER: true, DROP_LINK: true});
            } else {
                creep.multiFunction();
            }
            // creep.dropEnergy();
        },
        onNoEnergyContainers: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onHarvestEnergy: function() {
            var creep = Game.creeps[this.creepName];
            creep.harvestEnergy();
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
        var stateMachine = new harvesterFSM(creep.name);
        // console.log(statemachine.visualize(stateMachine));
        stateMachine.goto(creepState);
        if (_.sum(creep.carry) < creep.carryCapacity &&  !creep.memory.selectedSource && !creep.timeToDie() && stateMachine.can("energyEmpty")) {
            stateMachine.energyEmpty();
        }
        if (_.sum(creep.carry) < creep.carryCapacity && creep.memory.selectedSource && !creep.timeToDie() && stateMachine.can("sourceSelected")) {
            stateMachine.sourceSelected();
        }
        if ((_.sum(creep.carry) === creep.carryCapacity || creep.timeToDie()) && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        if (!MULTI_FUNCTION && _.sum(creep.carry) === creep.carryCapacity && cache.findEnergyContainers(creep.room).length === 0 && cache.findEmptyCollectors(creep.room).length === 0 && cache.findEnergyFedStructures(creep.room, false).length === 0 && stateMachine.can("noEnergyContainers")) {
            stateMachine.noEnergyContainers();
        }
        if (creep.timeToDie() && _.sum(creep.carry) === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleHarvester;