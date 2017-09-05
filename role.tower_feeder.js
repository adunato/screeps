var statemachine = require('state-machine');
var cache = require('cache');
var tower = Game.getObjectById('59ae431f754f653601b3b5b7');
var towerFeederSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: ['rest', 'withdraw', 'feed', 'spawn_withdraw'], to: 'withdraw'},
        {name: 'energyFull', from: '*', to: 'feed'},
        {name: 'containersEmpty', from: ['withdraw', 'spawn_withdraw', 'rest'], to: 'rest'},
        {name: 'timeToDie', from: ['withdraw', 'suicide', 'rest'], to: 'suicide'},
        {
            name: 'goto', from: '*', to: function (s) {
            return s
        }
        }
    ],
    data: function (creepName, initState) {
        return {
            creepName: creepName,
            initState: initState
        }
    },
    methods: {
        onEnergyEmpty: function () {
            var creep = Game.creeps[this.creepName];
            creep.withdrawEnergy();
        },
        onEnergyFull: function () {
            var creep = Game.creeps[this.creepName];
            creep.feedStructure(tower);
        },
        onContainersEmpty: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onTimeToDie: function () {
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


var roleTowerFeeder = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if(!tower)
            return;
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "withdraw";
        var stateMachine = new towerFeederSM(creep.name, "withdraw");
        stateMachine.goto(creepState);
        if (creep.carry.energy === 0 && stateMachine.can("energyEmpty")) {
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy > 0 && tower.energy < tower.energyCapacity && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        if (cache.findContainersWithEnergy(creep.room).length === 0 && stateMachine.can("containersEmpty")) {
            stateMachine.containersEmpty();
        }
        if (Game.flags[creep.memory.squad] === null && stateMachine.can("noFeederFlags")) {
            stateMachine.noFeederFlags();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")) {
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleTowerFeeder;