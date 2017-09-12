var statemachine = require('state-machine');
// var visualize = require('visualize');
var cache = require('cache');
var harvesterFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        //all "end-states" lead back to start
        {name: 'claim', from: ['none','claiming',], to: 'claiming'},
        {name: 'timeToDie', from: ['claiming','suicide'], to: 'suicide'},
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
        onClaiming: function () {
            var creep = Game.creeps[this.creepName];
            creep.goToClaim();
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


var roleHarvester = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "claiming";
        var stateMachine = new harvesterFSM(creep.name);
        // console.log(statemachine.visualize(stateMachine));
        stateMachine.goto(creepState);
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleHarvester;