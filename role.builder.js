var statemachine = require('state-machine');
var cache = require('cache');
var builderFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'energyEmpty', from: '*', to: 'carrier_withdraw'},
        //step to make it pick up energy from carrier if was going to pick up somewhere else (e.g. while carrier refueled) (do not enable 'build' here)
        {name: 'pickupFromCarrier', from: ['carrier_withdraw', 'spawn_withdraw', 'withdraw'], to: 'carrier_withdraw'},
        {name: 'carrierEmpty', from: ['carrier_withdraw', 'withdraw'], to: 'withdraw'},
        {name: 'energyFull', from: '*', to: 'build'},
        {name: 'noConstructions', from: ['*'], to: 'rest'},
        {name: 'containersEmpty', from: ['withdraw', 'spawn_withdraw','rest'], to: 'spawn_withdraw'},
        {name: 'spawnEmpty', from: 'spawn_withdraw', to: 'rest'},
        {name: 'timeToDie', from: ['carrier_withdraw', 'withdraw', 'rest', 'spawn_withdraw', 'suicide'], to: 'suicide'},
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
            // creep.withdrawEnergy();
            if(cache.getStoredEnergy(creep.room) > 0)
                creep.withdrawEnergyExCarriers();
            else
                creep.rest();
        },
        onEnergyEmpty: function () {
            var creep = Game.creeps[this.creepName];
            creep.withdrawEnergyFromCarrier();
        },
        onBuild: function () {
            var creep = Game.creeps[this.creepName];
            creep.buildConstruction();
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
        onNoConstructions: function () {
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
        //only check if in squad's room
        if (cache.findConstructionSites(creep.room).length === 0 && creep.isInSquadRoom() && stateMachine.can("noConstructions")) {
            stateMachine.noConstructions();
        }
        if (cache.findCarriersWithEnergy(creep.room).length === 0 && stateMachine.can("carrierEmpty")) {
            stateMachine.carrierEmpty();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleBuilder;