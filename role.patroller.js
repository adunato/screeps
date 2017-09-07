var statemachine = require('state-machine');
var cache = require('cache');
var patrollerFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'noEnemies', from: ['attack', 'next_waypoint', 'move'], to: 'move'},
        {name: 'atWaypoint', from: ['attack', 'move', 'next_waypoint'], to: 'next_waypoint'},
        {name: 'enemies', from: ['attack', 'next_waypoint', 'move'], to: 'attack'},
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
        onNextWaypoint: function () {
            var creep = Game.creeps[this.creepName];
            creep.goToNextWaypoint();
        },
        onAttack: function () {
            var creep = Game.creeps[this.creepName];
            creep.attackEnemies(false);
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
            creepState = "move";
        var stateMachine = new patrollerFSM(creep.name, creepState);
        stateMachine.goto(creepState);
        if (creep.room.find(FIND_HOSTILE_CREEPS).length > 0) {
            console.log("found enemies");
            stateMachine.enemies();
        } else {
            stateMachine.noEnemies();
        }
        if(creep.pos)
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")) {
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roledefender;