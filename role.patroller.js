var statemachine = require('state-machine');
var patrollerFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'noEnemies', from: ['attack', 'waypoint', 'move'], to: 'move'},
        {name: 'atWaypoint', from: ['move', 'waypoint'], to: 'waypoint'},
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
            creep.rangedAttack(false);
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
        if (creep.room.find(FIND_HOSTILE_CREEPS).length > 0 && !(!creep.room.controller.my && creep.room.controller.safeMode) && stateMachine.can("enemies")) {
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