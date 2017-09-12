var statemachine = require('state-machine');
// var visualize = require('visualize');
var cache = require('cache');
var harvesterFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        //all "end-states" lead back to start
        {name: 'claim', from: ['none','claiming',], to: 'claiming'},
        {name: 'timeToDie', from: ['claiming','suicide'], to: 'suicide'},
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
        onClaiming: function () {
            var creep = Game.creeps[this.creepName];
            creep.goToClaim();
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
        if (creep.carry.energy < creep.carryCapacity &&  !creep.memory.selectedSource && !creep.timeToDie() && stateMachine.can("energyEmpty")) {
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy < creep.carryCapacity && creep.memory.selectedSource && stateMachine.can("sourceSelected")) {
            stateMachine.sourceSelected();
        }
        if ((creep.carry.energy === creep.carryCapacity || creep.timeToDie()) && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        // if (cache.findSources(creep.room).length === 0 && stateMachine.can("noSource")) {
        //     stateMachine.noSource();
        // }
        if (cache.findEnergyContainers(creep.room).length === 0 && cache.findEmptyCollectors(creep.room).length === 0 && cache.findEnergyFedStructures(creep.room, false).length === 0 && stateMachine.can("noEnergyContainers")) {
            stateMachine.noEnergyContainers();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleHarvester;