var StateMachine = require('state-machine');
var cache = require('cache');
var upgraderFSM = new StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: '*', to: 'carrier_withdraw'},
        {name: 'carrierEmpty', from: 'carrier_withdraw', to: 'withdraw'},
        {name: 'energyFull', from: '*', to: 'upgrade'},
        {name: 'noControllers', from: ['*'], to: 'rest'},
        {name: 'containersEmpty', from: ['withdraw', 'spawn_withdraw','rest'], to: 'spawn_withdraw'},
        {name: 'spawnEmpty', from: 'spawn_withdraw', to: 'rest'},
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
        onWithdraw: function () {
            var creep = Game.creeps[this.creepName];
            creep.withdrawEnergy();
        },
        onEnergyEmpty: function () {
            var creep = Game.creeps[this.creepName];
            creep.withdrawEnergyFromCarrier();
        },
        onUpgrade: function () {
            var creep = Game.creeps[this.creepName];
            creep.upgradeController_();
        },
        onContainersEmpty: function () {
            var creep = Game.creeps[this.creepName];
            if(global.allowedToSpawnWithdraw)
                creep.withdrawEnergyFromSpawn();
        },
        onSpawnEmpty: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onNoControllers: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
        },
        onTransition(lifecycle) {
            console.log("transition name: " + lifecycle.transition);
            console.log("transition from: " + lifecycle.from);
            console.log("transition to: " + lifecycle.to);
        }
    }
});


var roleupgrader = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "withdraw";
        var stateMachine = new upgraderFSM(creep.name, "withdraw");
        stateMachine.goto(creepState);
        if (creep.carry.energy === 0) {
            stateMachine.energyEmpty();
        }
        if (creep.carry.energy === creep.carryCapacity && stateMachine.can("energyFull")) {
            stateMachine.energyFull();
        }
        if (cache.findContainersWithEnergy(creep.room).length === 0 && stateMachine.can("containersEmpty")) {
            stateMachine.containersEmpty();
        }
        if (cache.findCarriersWithEnergy(creep.room).length === 0 && stateMachine.can("carrierEmpty")) {
            stateMachine.carrierEmpty();
        }
        if (cache.findSpawnWithEnergy(creep.room).length === 0 && stateMachine.can("spawnEmpty")) {
            stateMachine.spawnEmpty();
        }
        if (creep.room.controller === null && stateMachine.can("noControllers")) {
            stateMachine.noControllers();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleupgrader;