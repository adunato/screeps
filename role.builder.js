var statemachine = require('state-machine');
var cache = require('cache');
var builderFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: ['rest','withdraw', 'build', 'spawn_withdraw'], to: 'withdraw'},
        {name: 'energyFull', from: '*', to: 'build'},
        {name: 'noConstructions', from: ['*'], to: 'rest'},
        {name: 'containersEmpty', from: ['withdraw', 'spawn_withdraw', 'rest'], to: 'spawn_withdraw'},
        {name: 'spawnEmpty', from: ['spawn_withdraw', 'rest'], to: 'rest'},
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
            creep.buildConstruction();
        },
        onNoConstructions: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onContainersEmpty: function () {
            var creep = Game.creeps[this.creepName];
            if(global.allowedToSpawnWithdraw)
                creep.withdrawEnergyFromSpawn();
            else
                creep.rest();
        },
        onSpawnEmpty: function () {
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
        if (typeof creepState === "undefined")
            creepState = "withdraw";
        var stateMachine = new builderFSM(creep.name, "withdraw");
        stateMachine.goto(creepState);
        if (creep.carry.energy === 0 && stateMachine.can("energyEmpty")) {
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy > 0 && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        if (cache.findContainersWithEnergy(creep.room).length === 0 && stateMachine.can("containersEmpty")) {
            stateMachine.containersEmpty();
        }
        if (cache.findSpawnWithEnergy(creep.room).length === 0 && stateMachine.can("spawnEmpty")) {
            stateMachine.spawnEmpty();
        }
        if (cache.findConstructionSites(creep.room).length === 0 && stateMachine.can("noConstructions")) {
            stateMachine.noConstructions();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleBuilder;