var statemachine = require('state-machine');
// var visualize = require('visualize');
var cache = require('cache');
var reserverFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        //all "end-states" lead back to start
        {name: 'reserve', from: ['none','reserving',], to: 'reserving'},
        {name: 'timeToDie', from: ['reserving','suicide'], to: 'suicide'},
        {
            name: 'goto', from: '*', to: function (s) {
            return s
        }
        }
    ],
    data: function (creepName) {
        return {
            creepName: creepName
        }
    },
    methods: {
        onReserving: function () {
            var creep = Game.creeps[this.creepName];
            creep.goToReserve();
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


var roleReserver = {
    /** @param {Creep} creep **/
    run: function (creep) {
        console.log("reserver")
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "reserving";
        var stateMachine = new reserverFSM(creep.name);
        // console.log(statemachine.visualize(stateMachine));
        stateMachine.goto(creepState);
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleReserver;