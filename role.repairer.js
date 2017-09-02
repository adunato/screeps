var StateMachine = require('state-machine');
var cache = require('cache');
var repairrFSM = new StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: '*', to: 'withdraw'},
        {name: 'energyFull', from: '*', to: 'repair'},
        {name: 'noStructures', from: ['*'], to: 'rest'},
        {name: 'containersEmpty', from: ['withdraw', 'spawn_withdraw'], to: 'spawn_withdraw'},
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
        onRepair: function () {
            var creep = Game.creeps[this.creepName];
            creep.repairConstruction();
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
        onNoStructures: function () {
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


var rolerepairr = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "withdraw";
        var stateMachine = new repairrFSM(creep.name, "withdraw");
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
        if (cache.findSpawnWithEnergy(creep.room).length === 0 && stateMachine.can("spawnEmpty")) {
            stateMachine.spawnEmpty();
        }
        if (cache.findRepairStructures(creep.room).length === 0 && stateMachine.can("noStructures")) {
            stateMachine.noStructures();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = rolerepairr;