var statemachine = require('state-machine');
var patrollerFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'noEnemies', from: ['attack', 'waypoint', 'move'], to: 'move'},
        {name: 'atWaypoint', from: ['attack', 'move', 'waypoint'], to: 'waypoint'},
        {name: 'enemies', from: ['attack', 'waypoint', 'move'], to: 'attack'},
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
        onMove: function () {
            var creep = Game.creeps[this.creepName];
            creep.goToWaypoint();
        },
        onWaypoint: function () {
            var creep = Game.creeps[this.creepName];
            creep.setNextWaypoint();
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


var rolepatroller = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "waypoint";
        var stateMachine = new patrollerFSM(creep.name, creepState);
        stateMachine.goto(creepState);
        if (creep.room.find(FIND_HOSTILE_CREEPS).length > 0) {
            console.log("found enemies");
            stateMachine.enemies();
        } else {
            stateMachine.noEnemies();
        }
        if(creep.isInCurrentWaypointRange()){
            stateMachine.atWaypoint();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")) {
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = rolepatroller;