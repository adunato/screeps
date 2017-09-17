var statemachine = require('state-machine');
var medicFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'noInjured', from: ['heal', 'goHome', 'follow'], to: 'follow'},
        {name: 'noLeader', from: ['follow', 'waypoint'], to: 'goHome'},
        {name: 'injured', from: ['heal', 'goHome', 'follow'], to: 'heal'},
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
        onFollow: function () {
            var creep = Game.creeps[this.creepName];
            creep.followAssaultSquadLeader();
        },
        //invoked as events to avoid state being invoked when loaded by the state machine
        onGoHome: function () {
            var creep = Game.creeps[this.creepName];
            creep.goHome();
        },
        onInjured: function () {
            var creep = Game.creeps[this.creepName];
            creep.healTeamMates();
        },
        onTransition(lifecycle) {
            // console.log("transition name: " + lifecycle.transition);
            // console.log("transition from: " + lifecycle.from);
            // console.log("transition to: " + lifecycle.to);
        }
    }
});


var rolemedic = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (!creepState || typeof creepState === "undefined") {
            creepState = "goHome";
        }
        var stateMachine = new medicFSM(creep.name, creepState);
        stateMachine.goto(creepState);
        if(creep.getAssaultSquadLeader() === null && stateMachine.can("noLeader")){
            stateMachine.noLeader();
        }
        else if (creep.findInjuredTeamMates().length > 0 && stateMachine.can("injured")) {
            console.log("found injured");
            stateMachine.injured();
        } else if(stateMachine.can("noInjured")){
            stateMachine.noInjured();
        }
        creep.memory.state = stateMachine.state;
        console.log("medic state: " + creep.memory.state);
    }
};

module.exports = rolemedic;