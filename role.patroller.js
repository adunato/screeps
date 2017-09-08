var statemachine = require('state-machine');
var patrollerFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'noEnemies', from: ['attack', 'waypoint', 'move'], to: 'move'},
        {name: 'atWaypoint', from: ['attack', 'move'], to: 'waypoint'},
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
        //invoked as events to avoid state being invoked when loaded by the state machine
        onNoEnemies: function () {
            var creep = Game.creeps[this.creepName];
            creep.goToWaypoint();
        },
        onAtWaypoint: function () {
            var creep = Game.creeps[this.creepName];
            creep.setNextWaypoint();
        },
        onEnemies: function () {
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
            stateMachine.onEnemies();
        } else {
            stateMachine.onNoEnemies();
        }
        if(creep.isInCurrentWaypointRange()){
            stateMachine.onAtWaypoint();
        } else {
            stateMachine.onNoEnemies();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")) {
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = rolepatroller;