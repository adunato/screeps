var statemachine = require('state-machine');
var cache = require('cache');
var defenderFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'noEnemies', from: ['attack', 'squad_rally'], to: 'squad_rally'},
        {name: 'enemies', from: ['attack', 'squad_rally'], to: 'attack'},
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
        return;
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "noEnemies";
        var stateMachine = new defenderFSM(creep.name, "noEnemies");
        stateMachine.goto(creepState);
        if (creep.room.find(FIND_HOSTILE_CREEPS)) {
            stateMachine.enemies();
        } else {
            stateMachine.noEnemies();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")) {
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roledefender;