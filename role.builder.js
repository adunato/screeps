var StateMachine = require('state-machine')
var builderFSM = new StateMachine.factory({
    init: 'none',
    transitions: [
        { name: 'energyEmpty', from: 'build',  to: 'withdraw' },
        { name: 'energyFull', from: 'withdraw', to: 'build'  },
        { name: 'containersEmpty', from: 'withdraw', to: 'rest'  },
        { name: 'goto', from: '*', to: function(s) { return s } }
    ],
    data: function(creepName, initState) {
        return {
            creepName: creepName,
            initState: initState
        }
    },
    methods: {
        onWithdraw:     function() {
            var creep = Game.creeps[this.creepName];
            creep.withdrawEnergy();
        },
        onBuild:     function() {
            var creep = Game.creeps[this.creepName];
            creep.buildConstruction();
        },
        onTransition(lifecycle){
            console.log("transition name: " + lifecycle.transition);
            console.log("transition from: " + lifecycle.from);
            console.log("transition to: " + lifecycle.to);
        }
    }
});


var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var creepState = creep.memory.state;
            if(typeof creepState === "undefined")
                creepState = "withdraw";
        var stateMachine = new builderFSM(creep.name,"withdraw");
        stateMachine.goto(creepState);
        if(creep.carry.energy === 0){
            try {
                stateMachine.energyEmpty();
            }
            catch(err){
                console.log("error: " + err);
            }
        }
        if(creep.carry.energy === creep.carryCapacity){
            try {
                stateMachine.energyFull();
            }
            catch(err){
                console.log("error: " + err);
            }
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleBuilder;