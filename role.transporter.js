var statemachine = require('state-machine');
var cache = require('cache');
var carrierFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'sourceFull', from: ['rest','withdraw_source','drop_destination'], to: 'withdraw_source'},
        {name: 'creepFull', from: ['rest','withdraw_source','drop_destination'], to: 'drop_destination'},
        {name: 'nothingToDo', from: ['rest','withdraw_source','drop_destination'], to: 'rest'},
        {name: 'timeToDie', from: ['rest','withdraw_source'], to: 'timeToDie'},
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
        onWithdrawSource: function () {
            var creep = Game.creeps[this.creepName];
            creep.withdrawEnergyFromSourceContainer();
        },
        onDropDestination: function () {
            var creep = Game.creeps[this.creepName];
            creep.dropToDestinationContainer();
        },
        onRest: function () {
            var creep = Game.creeps[this.creepName];
            creep.rest();
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


var roleCarrier = {
    /** @param {Creep} creep **/
    run: function (creep) {
        var creepState = creep.memory.state;
        if (typeof creepState === "undefined")
            creepState = "rest";
        var stateMachine = new carrierFSM(creep.name, "rest");
        stateMachine.goto(creepState);
        if (creep.timeToDie() && creep.carry.energy === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        if (cache.findSourceContainersWithEnergy(creep.room).length > 0 && stateMachine.can("sourceFull")) {
            stateMachine.sourceFull();
        }
        if (creep.carry.energy === creep.carryCapacity && cache.findEmptyDestinationContainers(creep.room).length > 0 && stateMachine.can("creepFull")) {
            stateMachine.creepFull();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleCarrier;