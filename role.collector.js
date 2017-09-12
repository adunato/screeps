var statemachine = require('state-machine');
var cache = require('cache');
var collectorFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: ['none', 'rest', 'collectEnergy'], to: 'collectEnergy'},
        {name: 'energyFull', from: ['collectEnergy', 'rest','dropEnergy','reDropEnergy'], to: 'dropEnergy'},
        {name: 'reDropEnergy', from: ['dropEnergy','reDropEnergy'], to: 'reDropEnergy'},
        {name: 'noSource', from: ['collectEnergy', 'rest'], to: 'rest'},
        {name: 'nowhereToDrop', from: ['reDropEnergy','dropEnergy','rest'], to: 'rest'},
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
            creep.dropEnergy({DROP_CONTAINER : true,DROP_STRUCTURE : true, DROP_CARRIER : true});
        },
        onReDropEnergy: function () {
            var creep = Game.creeps[this.creepName];
            creep.dropEnergy({DROP_CONTAINER : true,DROP_STRUCTURE : true, DROP_CARRIER : true});
        },
        onNoSource: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onNowhereToDrop: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
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
        if (creep.carry.energy === 0 && stateMachine.can("nowhereToDrop")) {
            stateMachine.nowhereToDrop();
        }
        if (creep.carry.energy === creep.carryCapacity && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        if (creep.carry.energy < creep.carryCapacity && stateMachine.can("reDropEnergy")) {
            stateMachine.reDropEnergy();
        }
        if (cache.findSources(creep.room).length === 0 && stateMachine.can("noSource")) {
            stateMachine.noSource();
        }
        if (cache.findEmptyPlaceToDropStuff(creep.room, {DROP_CONTAINER : true,DROP_STRUCTURE : true, DROP_CARRIER : true}).length === 0 && stateMachine.can("nowhereToDrop")) {
            stateMachine.nowhereToDrop();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleHarvester;