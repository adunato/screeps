var statemachine = require('state-machine');
var cache = require('cache');
var MIN_SOURCE_CONTAINER_QUANTITY_PC = 20;
var MAX_DESTINATION_CONTAINER_QUANTITY_PC = 80;
var carrierFSM = new statemachine.StateMachine.factory({
    init: 'none',
    transitions: [
        {name: 'sourceFull', from: ['rest','withdraw_source','drop_destination','drop_storage'], to: 'withdraw_source'},
        {name: 'creepFull', from: ['rest','withdraw_source','drop_destination'], to: 'drop_destination'},
        {name: 'containersFull', from: ['drop_destination','rest','drop_storage'], to: 'drop_storage'},
        {name: 'nothingToDo', from: ['rest','withdraw_source','drop_destination','drop_storage'], to: 'rest'},
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
            creep.withdrawEnergyFromSourceContainer(MIN_SOURCE_CONTAINER_QUANTITY_PC);
        },
        onDropDestination: function () {
            var creep = Game.creeps[this.creepName];
            creep.dropToDestinationContainer(MAX_DESTINATION_CONTAINER_QUANTITY_PC);
        },
        onDropStorage: function () {
            var creep = Game.creeps[this.creepName];
            creep.dropToStorage();
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
        var sourceContainers = cache.findSourceContainersWithEnergy(creep.room,MIN_SOURCE_CONTAINER_QUANTITY_PC).length;
        var destinationContainers = cache.findEmptyDestinationContainers(creep.room,MAX_DESTINATION_CONTAINER_QUANTITY_PC).length;
        var storage = cache.findEmptyStorage(creep.room).length;
        var creepCarryEnergy = creep.carry.energy;
        var creepCarryCapacity = creep.carryCapacity;
        console.log("destinationContainers " + destinationContainers)
        console.log("storage " + storage)

        if (typeof creepState === "undefined")
            creepState = "rest";
        var stateMachine = new carrierFSM(creep.name, "rest");
        stateMachine.goto(creepState);
        if (creep.timeToDie() && creepCarryEnergy === 0 && stateMachine.can("timeToDie")){
            stateMachine.timeToDie();
        }
        if (sourceContainers > 0 && stateMachine.can("sourceFull")) {
            stateMachine.sourceFull();
        }
        //no source and creep is empty
        if ((sourceContainers === 0 && creepCarryEnergy === 0)
            || (destinationContainers === 0 && storage === 0 && creepCarryEnergy === creepCarryCapacity)
            && stateMachine.can("nothingToDo")) {
            stateMachine.nothingToDo();
        }
        if (creepCarryEnergy === creepCarryCapacity && stateMachine.can("creepFull")) {
            stateMachine.creepFull();
        }
        if (destinationContainers === 0 && stateMachine.can("containersFull")) {
            stateMachine.containersFull();
        }
        creep.memory.state = stateMachine.state;
    }
};

module.exports = roleCarrier;