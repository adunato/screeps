var statemachine = require('state-machine');
var cache = require('cache');
var defenderFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'noEnemies', from: ['attack', 'noEnemies'], to: 'squad_rally'},
        {name: 'enemies', from: ['attack', 'noEnemies'], to: 'attack'},
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
        onSquadRally: function () {
            var creep = Game.creeps[this.creepName];
            creep.squadRally();
        },
        onAttack: function () {
            var creep = Game.creeps[this.creepName];
            creep.attackEnemies();
        },
        onTransition(lifecycle) {
            // console.log("transition name: " + lifecycle.transition);
            // console.log("transition from: " + lifecycle.from);
            // console.log("transition to: " + lifecycle.to);
        }
    }
});


var roledefender = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "squad_rally";
        var stateMachine = new defenderFSM(creep.name, "squad_rally");
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
        if (cache.findCarriersWithEnergy(creep.room).length === 0 && stateMachine.can("carrierEmpty")) {
            stateMachine.carrierEmpty();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")) {
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roledefender;