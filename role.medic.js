var statemachine = require('state-machine');
var patrollerFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'noInjured', from: ['heal', 'waypoint', 'move'], to: 'move'},
        {name: 'atWaypoint', from: ['move', 'waypoint'], to: 'waypoint'},
        {name: 'injured', from: ['heal', 'waypoint', 'move'], to: 'heal'},
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
        //invoked as events to avoid state being invoked when loaded by the state machine
        onAtWaypoint: function () {
            var creep = Game.creeps[this.creepName];
            creep.setNextWaypoint();
        },
        onInjured: function () {
            var creep = Game.creeps[this.creepName];
            creep.healCreeps();
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
        var firstStep = false;
        if (!creepState || typeof creepState === "undefined") {
            //set firstStep = true if squad has been set
            if(creep.memory.squad) {
                creepState = "waypoint";
                firstStep = true;
            } else
                return;
        }
        var stateMachine = new patrollerFSM(creep.name, creepState);
        stateMachine.goto(creepState);
        //kick off WP selection if first step
        if(firstStep){
            console.log("setting default patroller WP")
            stateMachine.atWaypoint();
            creep.memory.state = stateMachine.state;
            return;
        }
        if (creep.room.find(FIND_MY_CREEPS).length > 0 && stateMachine.can("enemies")) {
            console.log("found enemies");
            stateMachine.enemies();
        }
        else if(creep.isInCurrentWaypointRange() && stateMachine.can("atWaypoint")){
            stateMachine.atWaypoint();
        } else if (stateMachine.can("noEnemies")){
            stateMachine.noEnemies();
        }
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")) {
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = rolepatroller;